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

        const windowEnd = messageValue['window_end']
        const symbol = (messageValue['symbol'] as string).padEnd(8, ' ')
        const action = messageValue['buy_or_sell_action']
        const emaj_38 = messageValue['emaj_38'].toFixed(5)
        const emaj_100 = messageValue['emaj_100'].toFixed(5)
        const prev_emaj_38 = messageValue['prev_emaj_38'].toFixed(5)
        const prev_emaj_100 = messageValue['prev_emaj_100'].toFixed(5)

        const BUYSELL_LOG = `Action: ${action}  WindowEnd: ${new Date(windowEnd).toISOString()}  Symbol: ${symbol}  Emaj_38: ${emaj_38}  PrevWindowEmaj_38: ${prev_emaj_38}  Emaj_100: ${emaj_100}  PrevWindowEmaj_100: ${prev_emaj_100}`

        logger.writeToLog(BUYSELL_LOG)
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
