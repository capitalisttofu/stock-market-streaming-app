import { RawTradeEvent } from '../../generatedProto/compiled'
import { BUY_SELL_ADVICE_TOPIC } from '../constants'
import { BuySellEventAvro } from '../lib/avro'
import { getConsumer, producer } from '../lib/kafka'

const CONSUMER_ID = 'test_buy_sell_consumer'

export const main = async () => {
  const consumer = getConsumer(CONSUMER_ID)
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

        // TODO: Add some interval logic here to flush if taken too long since previous flush
        // incase messages come slower
        if (messageCounter % 1000 === 0) {
          console.log('last recieved message value', messageValue)
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
