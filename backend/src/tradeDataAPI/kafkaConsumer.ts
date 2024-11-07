import { TradeEvent } from '../../generatedProto/compiled'
import { getConsumer } from '../lib/kafka'

export const consumeMessages = async (consumerId: string, topic: string) => {
  const tradeDataConsumer = getConsumer(consumerId)

  try {
    await tradeDataConsumer.connect()
    await tradeDataConsumer.subscribe({ topic, })

    let messageCounter = 0

    await tradeDataConsumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }

        messageCounter += 1

        const decoded = TradeEvent.decode(message.value)
        console.log(`Consumer ${consumerId}: ${JSON.stringify(decoded)}`)

        // TODO: send data to frontend

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