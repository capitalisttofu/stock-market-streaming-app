import { EMA_RESULTS_TOPIC } from '../constants'
import { EMAResultEventAvro } from '../lib/avro'
import { getConsumer } from '../lib/kafka'

const CONSUMER_GROUP_ID = 'test_ema_consumer'

export const main = async () => {
  const consumer = getConsumer(CONSUMER_GROUP_ID)
  await consumer.connect()

  try {
    await consumer.subscribe({
      topic: EMA_RESULTS_TOPIC,
    })

    let messageCounter = 0

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }
        messageCounter++

        const messageValue = EMAResultEventAvro.fromBuffer(message.value)

        console.log('last recieved message value', messageValue)
        console.log(
          `Processed messages: ${messageCounter}`,
          new Date().toISOString(),
        )
      },
    })
  } catch (e) {
    console.log('Error in consumer')
    console.log(e)
  }
}

void main()
