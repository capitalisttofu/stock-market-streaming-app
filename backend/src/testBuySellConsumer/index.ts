import { BUY_SELL_ADVICE_TOPIC } from '../constants'
import { BuySellEventAvro } from '../lib/avro'
import { getConsumer, producer } from '../lib/kafka'

const CONSUMER_GROUP_ID = 'test_buy_sell_consumer2'

export const main = async () => {
  const consumer = getConsumer(CONSUMER_GROUP_ID)
  await consumer.connect()
  await producer.connect()

  try {
    await consumer.subscribe({
      topic: BUY_SELL_ADVICE_TOPIC,
    })

    let messageCounter = 0

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }
        messageCounter++

        const messageValue = BuySellEventAvro.fromBuffer(message.value)

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
