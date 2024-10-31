import { RawTradeEvent } from '../../generatedProto/compiled'
import { SORTED_RAW_TRADE_DATA_TOPIC } from '../constants'
import { getConsumer, producer } from '../lib/kafka'
import { produceTradeData } from './produceTradeData'

const CONSUMER_ID = 'raw_trade_event_parser'

export const main = async () => {
  const consumer = getConsumer(CONSUMER_ID)
  await consumer.connect()
  await producer.connect()

  try {
    await consumer.subscribe({
      topic: SORTED_RAW_TRADE_DATA_TOPIC,
    })

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }
        const decoded = RawTradeEvent.decode(message.value)
        console.log(decoded)

        await produceTradeData(decoded)
      },
    })
  } catch (e) {
    console.log('Error in consumer')
    console.log(e)
  }
}

void main()
