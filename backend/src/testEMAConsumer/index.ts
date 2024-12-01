import { EMA_RESULTS_TOPIC, FLINK_PARALELLISM } from '../constants'
import { EMAResultEventAvro } from '../lib/avro'
import { getConsumer } from '../lib/kafka'
import { EventLogger } from '../lib/logger'

const CONSUMER_GROUP_ID = 'test_ema_consumer'

export const main = async () => {
  const consumer = getConsumer(CONSUMER_GROUP_ID)
  await consumer.connect()

  const logger = new EventLogger({
    logFileName: CONSUMER_GROUP_ID,
    windowLengthSeconds: 10,
  })

  try {
    await consumer.subscribe({
      topic: EMA_RESULTS_TOPIC,
    })

    logger.startWindowIntervalLogger()

    await consumer.run({
      partitionsConsumedConcurrently: FLINK_PARALELLISM,
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }

        const messageValue = EMAResultEventAvro.fromBuffer(message.value)

        logger.addToMetrics(
          messageValue['created_at_timestamp'],
          messageValue['window_end'],
        )
      },
    })
  } catch (e) {
    console.log('Error in consumer')
    console.log(e)
    logger.closeLogger()
  }
}

void main()
