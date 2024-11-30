import { BUY_SELL_ADVICE_TOPIC } from '../constants'
import { BuySellEventAvro } from '../lib/avro'
import { getConsumer } from '../lib/kafka'
import { EventLogger } from '../lib/logger'

const CONSUMER_GROUP_ID = 'test_buy_sell_consumer'

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
      topic: BUY_SELL_ADVICE_TOPIC,
    })

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }

        const messageValue = BuySellEventAvro.fromBuffer(message.value)

        logger.writeToLog(JSON.stringify(messageValue))
        logger.addToMetrics(
          messageValue['ema_created_at_timestamp'],
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
