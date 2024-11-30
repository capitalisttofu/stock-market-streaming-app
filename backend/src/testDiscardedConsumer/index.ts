import { DISCARDED_DATA_TOPIC } from '../constants'
import { RawTradeEventAvro } from '../lib/avro'
import { getConsumer } from '../lib/kafka'
import { EventLogger } from '../lib/logger'

const CONSUMER_GROUP_ID = 'test_discarded_consumer'

export const main = async () => {
  const consumer = getConsumer(CONSUMER_GROUP_ID)

  const logger = new EventLogger({
    logFileName: CONSUMER_GROUP_ID,
    windowLengthSeconds: 10,
  })

  await consumer.connect()

  logger.startWindowIntervalLogger()

  try {
    await consumer.subscribe({
      topic: DISCARDED_DATA_TOPIC,
    })

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }

        logger.addToMetrics(null, null)
      },
    })
  } catch (e) {
    console.log('Error in consumer')
    console.log(e)
    logger.closeLogger()
  }
}

void main()
