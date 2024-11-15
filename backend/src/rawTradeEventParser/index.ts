import { SORTED_RAW_TRADE_DATA_TOPIC } from '../constants'
import { RawTradeEventAvro } from '../lib/avro'
import { getConsumer, producer } from '../lib/kafka'
import { SecType } from '../secType'
import { produceDiscardedData } from './produceDiscardedData'
import { produceTradeData } from './produceTradeData'
import { waitEventTimeDifference } from './waitEventTimeDifference'

export type RawTradeEvent = {
  id: string
  sectype: SecType
  lasttradeprice: number | null
  tradingtime: number | null
  tradingdate: number | null
}

export type ParsedTradeEvent = {
  id: string
  symbol: string
  exchange: string
  sectype: SecType
  lastTradePrice: number
  lastUpdateTime: number
  lastTradeDate: number
}

const CONSUMER_GROUP_ID = 'raw_trade_event_parser'
let lastTradingTime: number | undefined = undefined

export const main = async () => {
  const consumer = getConsumer(CONSUMER_GROUP_ID)
  await consumer.connect()
  await producer.connect()

  try {
    await consumer.subscribe({
      topic: SORTED_RAW_TRADE_DATA_TOPIC,
    })

    let messageCounter = 0
    let discardedCounter = 0
    let tradeEventCounter = 0

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }
        messageCounter++

        const decoded: RawTradeEvent = RawTradeEventAvro.fromBuffer(
          message.value,
        )

        // Check that tradingTime, tradingDate and lastTradePrice exist
        if (
          decoded.tradingdate !== null &&
          decoded.lasttradeprice !== null &&
          decoded.tradingtime !== null
        ) {
          /*
          lastTradingTime = await waitEventTimeDifference(
            decoded.tradingtime,
            lastTradingTime,
          )
          */

          const [symbol, exchange] = decoded.id.split('.')
          const tradeEvent: ParsedTradeEvent = {
            id: decoded.id,
            symbol: symbol,
            exchange: exchange,
            sectype: decoded.sectype,
            lastTradePrice: decoded.lasttradeprice,
            lastUpdateTime: decoded.tradingtime,
            lastTradeDate: decoded.tradingdate,
          }

          produceTradeData(tradeEvent)
          tradeEventCounter++
        } else {
          // Discard data point
          produceDiscardedData(message.value)
          discardedCounter++
        }

        // TODO: Add some interval logic here to flush if taken too long since previous flush
        // incase messages come slower
        if (messageCounter % 10_000 === 0) {
          await producer.flush({ timeout: 5_000 })
        }

        if (messageCounter % 100_000 === 0) {
          console.log(
            `Processed messages: ${messageCounter}`,
            new Date().toISOString(),
          )
          console.log('Discard', discardedCounter)
          console.log('TradeEvents', tradeEventCounter)
        }
      },
    })
  } catch (e) {
    console.log('Error in consumer')
    console.log(e)
  }
}

void main()
