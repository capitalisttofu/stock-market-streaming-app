import { google, RawTradeEvent, SecType } from '../../generatedProto/compiled'
import { REALTIME_DATA_PRODUCTION_END_HOUR, REALTIME_DATA_PRODUCTION_START_HOUR, SORTED_RAW_TRADE_DATA_TOPIC } from '../constants'
import { getConsumer, producer } from '../lib/kafka'
import { produceTradeData } from './produceTradeData'
import { nanoSecondsToMilliseconds, secondsToHours } from './timeConversions'

export type ParsedTradeEvent = {
  id: string;
  symbol: string;
  exchange: string;
  sectype: SecType;
  lasttradeprice: number;
  lastUpdate: google.protobuf.ITimestamp;
  lastTrade?: google.protobuf.ITimestamp;
}

const CONSUMER_ID = 'raw_trade_event_parser'
let lastTradingTime: number | undefined = undefined

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

        // Check that tradingTime and lastTradePrice exits
        // Not checking trading data due to it being uncommon and not necessary for the computations
        if (
          decoded.lastTradePrice !== undefined &&
          decoded.lastTradePrice !== null &&
          decoded.tradingTime &&
          decoded.tradingTime.seconds !== null &&
          decoded.tradingTime.seconds !== undefined &&
          decoded.tradingTime.nanos !== null &&
          decoded.tradingTime.nanos !== undefined
        ) {
          const time = nanoSecondsToMilliseconds(Number(decoded.tradingTime.nanos))

          if (time > 0) {
            if (lastTradingTime) {
              const timeDifference = time - lastTradingTime

              if (timeDifference < 0) {
                console.log('Events are in incorrect order')
              }

              const tradingTimeHour = secondsToHours(Number(decoded.tradingTime.seconds))

              // tradingTimeHour is between REALTIME_DATA_PRODUCTION_START_HOUR and REALTIME_DATA_PRODUCTION_END_HOUR
              if (
                tradingTimeHour >= REALTIME_DATA_PRODUCTION_START_HOUR &&
                tradingTimeHour < REALTIME_DATA_PRODUCTION_END_HOUR
              ) {
                // Wait the time difference
                await new Promise((resolve) =>
                  setTimeout(resolve, timeDifference)
                )
              }
            }
            lastTradingTime = time
          }

          const [symbol, exchange] = decoded.id.split(".")
          const tradeEvent: ParsedTradeEvent = {
            id: decoded.id,
            symbol: symbol,
            exchange: exchange,
            sectype: decoded.secType,
            lasttradeprice: decoded.lastTradePrice,
            lastUpdate: decoded.tradingTime,
            lastTrade: decoded.tradingDate ? decoded.tradingDate : undefined,
          }
          await produceTradeData(tradeEvent)
        } else {
          // TODO: send to error stream
        }
      },
    })
  } catch (e) {
    console.log('Error in consumer')
    console.log(e)
  }
}

void main()
