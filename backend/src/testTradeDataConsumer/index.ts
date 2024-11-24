import { TRADE_DATA_TOPIC } from '../constants'
import { TradeEventAvro } from '../lib/avro'
import { getConsumer } from '../lib/kafka'

const CONSUMER_GROUP_ID = 'test_trade_data_consumer'

export const main = async () => {
  const consumer = getConsumer(CONSUMER_GROUP_ID)
  await consumer.connect()

  try {
    await consumer.subscribe({
      topic: TRADE_DATA_TOPIC,
    })

    let messageCounter = 0

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }
        messageCounter++

        const messageValue = TradeEventAvro.fromBuffer(message.value)

        if (messageCounter % 50_000 === 0) {
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
