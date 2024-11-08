import { TradeEvent } from '../../generatedProto/compiled'
import { TRADE_DATA_TOPIC } from '../constants'
import { getConsumer } from '../lib/kafka'
import { broadcastTradeEvent } from './socket'

export const consumeMessages = async (consumerId: string, topic: string) => {
  const consumer = getConsumer(consumerId)

  try {
    await consumer.connect()
    await consumer.subscribe({ topic })

    let messageCounter = 0

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }

        messageCounter += 1

        // Broadcast new messages in trade topic
        if (topic === TRADE_DATA_TOPIC) {
          const decoded = TradeEvent.decode(message.value)
          console.log(`Consumer ${consumerId}: ${JSON.stringify(decoded)}`)

          broadcastTradeEvent(topic, decoded)
        }

        if (messageCounter % 10_000 === 0) {
          console.log(
            `Processed messages by ${consumerId}: ${messageCounter}`,
          )
        }
      }


    })
  } catch (e) {
    console.log(`Error in ${consumerId} consumer`)
    console.log(e)
  }
}