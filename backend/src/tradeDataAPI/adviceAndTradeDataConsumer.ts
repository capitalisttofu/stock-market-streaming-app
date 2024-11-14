import { getConsumer } from '../lib/kafka'
import { TRADE_DATA_TOPIC, BUY_SELL_ADVICE_TOPIC } from '../constants'
import { BuySellEventAvro, TradeEventAvro } from '../lib/avro'

const CONSUMER_ID = 'trade_data_and_buy_sell_advice'

export const consumeTradeEvents = async () => {
  const consumer = getConsumer(CONSUMER_ID)

  try {
    await consumer.connect()
    await consumer.subscribe({ topics: [TRADE_DATA_TOPIC, BUY_SELL_ADVICE_TOPIC] })

    let tradeEventMessageCounter = 0
    let adviceMessageCounter = 0

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
          console.log(`${JSON.stringify(decoded)}`)

          // TODO: send event with websockets to the frontend

          if (tradeEventMessageCounter % 10_000 === 0) {
            console.log(
              `Processed messages from ${topic}: ${tradeEventMessageCounter}`,
            )
          }
        } else if (topic === BUY_SELL_ADVICE_TOPIC) {
          adviceMessageCounter += 1

          const decoded = BuySellEventAvro.fromBuffer(message.value)
          console.log(`${JSON.stringify(decoded)}`)

          // TODO: send event with websockets to the frontend

          if (adviceMessageCounter % 10_000 === 0) {
            console.log(
              `Processed messages from ${topic}: ${adviceMessageCounter}`,
            )
          }
        }
      }


    })
  } catch (e) {
    console.log(`Error in consumer`)
    console.log(e)
  }
}