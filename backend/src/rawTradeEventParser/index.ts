import {
  REALTIME_DATA_PRODUCTION_END_HOUR,
  REALTIME_DATA_PRODUCTION_START_HOUR,
  SORTED_RAW_TRADE_DATA_TOPIC,
} from '../constants'
import { RawTradeEventAvro } from '../lib/avro'
import { getConsumer, producer } from '../lib/kafka'
import { SecType } from '../secType'
import { produceDiscardedData } from './produceDiscardedData'
import { produceTradeData } from './produceTradeData'

export type RawTradeEvent = {
  id: string
  sectype: SecType
  lasttradeprice: number | null
  tradingtime: number | null
  tradingdate: number | null
}

export type ParsedTradeEvent = {
  id: string
  symbol: string
  exchange: string
  sectype: SecType
  lastTradePrice: number
  lastUpdateTime: number
  lastTradeDate: number
}

const CONSUMER_ID = 'raw_trade_event_parser'
let lastTradingTime: number | undefined = undefined

const millisecondsToHours = (milliseconds: number) => {
  return Math.floor(milliseconds / 3_600_000)
}


export const main = async () => {
  const consumer = getConsumer(CONSUMER_ID)
  await consumer.connect()
  await producer.connect()

  try {
    await consumer.subscribe({
      topic: SORTED_RAW_TRADE_DATA_TOPIC,
    })

    let messageCounter = 0
    let discardedCounter = 0
    let tradeEventCounter = 0

    await consumer.run({
      // Process per message
      eachMessage: async ({ message, partition, topic }) => {
        if (!message.value) {
          return
        }
        messageCounter++

        const decoded: RawTradeEvent = RawTradeEventAvro.fromBuffer(message.value)

        // Check that tradingTime, tradingDate and lastTradePrice exist
        if (
          decoded.tradingdate !== null &&
          decoded.lasttradeprice !== null &&
          decoded.tradingtime !== null
        ) {
          const timeMillis = decoded.tradingtime

          if (timeMillis > 0) {
            if (lastTradingTime !== undefined) {
              const timeDifference = timeMillis - lastTradingTime

              if (timeDifference < 0) {
                console.log('Events are in incorrect order')
              }

              const timeHour = millisecondsToHours(timeMillis)
              // timeHour is between REALTIME_DATA_PRODUCTION_START_HOUR and REALTIME_DATA_PRODUCTION_END_HOUR
              if (
                timeHour >= REALTIME_DATA_PRODUCTION_START_HOUR &&
                timeHour < REALTIME_DATA_PRODUCTION_END_HOUR
              ) {
                // Wait the time difference
                await new Promise((resolve) =>
                  setTimeout(resolve, timeDifference),
                )
              }
            }
            lastTradingTime = timeMillis
          }

          const [symbol, exchange] = decoded.id.split('.')
          const tradeEvent: ParsedTradeEvent = {
            id: decoded.id,
            symbol: symbol,
            exchange: exchange,
            sectype: decoded.sectype,
            lastTradePrice: decoded.lasttradeprice,
            lastUpdateTime: decoded.tradingtime,
            lastTradeDate: decoded.tradingdate,
          }

          produceTradeData(tradeEvent)
          tradeEventCounter++
        } else {
          // Discard data point
          produceDiscardedData(decoded)
          discardedCounter++
        }

        // TODO: Add some interval logic here to flush if taken too long since previous flush
        // incase messages come slower
        if (messageCounter % 10_000 === 0) {
          await producer.flush({ timeout: 5_000 })
        }

        if (messageCounter % 100_000 === 0) {
          console.log(
            `Processed messages: ${messageCounter}`,
            new Date().toISOString(),
          )
          console.log('Discard', discardedCounter)
          console.log('TradeEvents', tradeEventCounter)
        }
      },
    })
  } catch (e) {
    console.log('Error in consumer')
    console.log(e)
  }
}

void main()
