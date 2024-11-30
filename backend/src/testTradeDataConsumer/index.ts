import { TRADE_DATA_TOPIC } from '../constants'
import { TradeEventAvro } from '../lib/avro'
import { getConsumer } from '../lib/kafka'
import { EventLogger } from '../lib/logger'

const CONSUMER_GROUP_ID = 'test_trade_data_consumer'

export const main = async () => {
  const consumer = getConsumer(CONSUMER_GROUP_ID)
  await consumer.connect()

  const logger = new EventLogger({
    logFileName: CONSUMER_GROUP_ID,
    windowLengthSeconds: 10,
  })

  try {
    await consumer.subscribe({
      topic: TRADE_DATA_TOPIC,
    })

    logger.startWindowIntervalLogger()

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }

        const messageValue = TradeEventAvro.fromBuffer(message.value)

        logger.addToMetrics(
          messageValue['created_at_timestamp'],
          messageValue['timestamp'],
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
