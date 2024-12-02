import { getConsumer } from '../lib/kafka'
import {
  TRADE_DATA_TOPIC,
  BUY_SELL_ADVICE_TOPIC,
  EMA_RESULTS_TOPIC,
} from '../constants'
import {
  BuySellEventAvro,
  EMAResultEventAvro,
  TradeEventAvro,
} from '../lib/avro'
import {
  broadcastEventToAll,
  broadcastEventToSubscribers,
  broadcastNewSymbolToSubscribers,
} from './socket'

export const symbols = new Set()
export const emajEventsBySymbol: Record<string, Array<any>> = {}
export const tradeEventsBySymbol: Record<string, Array<any>> = {}
export const buySellEvents: Array<any> = []

const CONSUMER_GROUP_ID = 'trade_data_and_buy_sell_advice'

export const consumeTradeEvents = async () => {
  const consumer = getConsumer(CONSUMER_GROUP_ID)

  try {
    await consumer.connect()
    await consumer.subscribe({
      topics: [TRADE_DATA_TOPIC, BUY_SELL_ADVICE_TOPIC, EMA_RESULTS_TOPIC],
    })

    let tradeEventMessageCounter = 0
    let adviceMessageCounter = 0
    let emaMessageCounter = 0

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }

        // Broadcast new messages in trade topic
        if (topic === TRADE_DATA_TOPIC) {
          tradeEventMessageCounter += 1

          const decoded = TradeEventAvro.fromBuffer(message.value)
          const symbol = decoded.symbol

          if (!tradeEventsBySymbol[symbol]) {
            tradeEventsBySymbol[symbol] = []
          }
          tradeEventsBySymbol[symbol].push(decoded)

          if (!symbols.has(symbol)) {
            symbols.add(symbol)
            broadcastNewSymbolToSubscribers(symbol)
          }

          // Broadcast event with websockets to the frontend
          broadcastEventToSubscribers(
            'trade-event-message',
            decoded.symbol,
            decoded,
          )

          if (tradeEventMessageCounter % 1_000 === 0) {
            console.log(
              `Processed messages from ${topic}: ${tradeEventMessageCounter}`,
            )
          }
        } else if (topic === BUY_SELL_ADVICE_TOPIC) {
          adviceMessageCounter += 1

          const decoded = BuySellEventAvro.fromBuffer(message.value)

          buySellEvents.push(decoded)

          broadcastEventToAll('buy-sell-advice-message', decoded)

          if (adviceMessageCounter % 100 === 0) {
            console.log(
              `Processed messages from ${topic}: ${adviceMessageCounter}`,
            )
          }
        } else if (topic === EMA_RESULTS_TOPIC) {
          emaMessageCounter += 1

          const decoded = EMAResultEventAvro.fromBuffer(message.value)
          const symbol = decoded.symbol

          if (!emajEventsBySymbol[symbol]) {
            emajEventsBySymbol[symbol] = []
          }
          emajEventsBySymbol[symbol].push(decoded)

          // Broadcast event with websockets to the frontend
          broadcastEventToSubscribers(
            'ema-result-event-message',
            decoded.symbol,
            decoded,
          )

          if (emaMessageCounter % 1_000 === 0) {
            console.log(
              `Processed messages from ${topic}: ${emaMessageCounter}`,
            )
          }
        }
      },
    })
  } catch (e) {
    console.log(`Error in consumer`)
    console.log(e)
  }
}
