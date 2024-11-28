import { DISCARDED_DATA_TOPIC } from '../constants'
import { RawTradeEventAvro } from '../lib/avro'
import { getConsumer } from '../lib/kafka'

const CONSUMER_GROUP_ID = 'test_discarded_consumer'

export const main = async () => {
  const consumer = getConsumer(CONSUMER_GROUP_ID)
  await consumer.connect()

  try {
    await consumer.subscribe({
      topic: DISCARDED_DATA_TOPIC,
    })

    let messageCounter = 0

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }
        messageCounter++

        const messageValue = RawTradeEventAvro.fromBuffer(message.value)

        if (messageCounter % 100_000 === 0) {
          console.log('last recieved message value', messageValue)
          console.log('Total count', messageCounter)
          console.log(
            `Processed messages: ${messageCounter}`,
            new Date().toISOString(),
          )
        }
      },
    })
  } catch (e) {
    console.log('Error in consumer')
    console.log(e)
  }
}

void main()
