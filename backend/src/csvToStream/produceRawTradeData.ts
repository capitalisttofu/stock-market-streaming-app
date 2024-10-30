import { RawTradeEvent, SecType } from '../../generatedProto/compiled'
import { SORTED_RAW_TRADE_DATA_TOPIC } from '../constants'
import { producer } from '../lib/kafka'

const sleep = async (milliseconds: number) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(milliseconds), milliseconds),
  )

type ParsedRawData = {
  id: string
  secType: SecType
  lastTradePrice?: number
  tradingDate?: string
  tradingTime?: string
}

const data: Array<ParsedRawData> = [
  {
    id: 'IDECD.FR',
    secType: SecType.E,
    lastTradePrice: 23,
    tradingDate: '2021-01-01',
    tradingTime: '03:00:11.273',
  },
  {
    id: 'LARF.FR',
    secType: SecType.I,
    lastTradePrice: 10,
    tradingDate: '2021-01-01',
    tradingTime: '04:00:11.273',
  },
  {
    id: 'IXBTI.FR',
    secType: SecType.E,
    lastTradePrice: 23,
    tradingDate: '2021-01-01',
    tradingTime: '05:00:11.273',
  },
  {
    id: 'IDECD.FR',
    secType: SecType.E,
    lastTradePrice: 14,
    tradingDate: '2021-01-01',
    tradingTime: '06:00:11.273',
  },
]

export const main = async () => {
  await producer.connect()

  try {
    for (const datapoint of data) {
      // Create validates the message, so might be better
      // but it can be more efficient to code directly
      // leaving this code here for future reference and example
      /*
            const message = RawTradeEvent.create(datapoint)
        
            const encoded = RawTradeEvent.encode(message).finish()
        
            const res = RawTradeEvent.decode(encoded)
            console.log(res)
            */

      const encoded = RawTradeEvent.encode(datapoint).finish()
      const buffer = Buffer.from(encoded)

      await producer.send({
        topic: SORTED_RAW_TRADE_DATA_TOPIC,
        // Adding a key to the message object here
        // would result in it being used in the partitioning logic
        // where all messages with same key go to same partition
        messages: [{ value: buffer }],
      })
    }
  } catch (e) {
    console.log('Error occured')
  } finally {
    await producer.disconnect()
    process.exit()
  }
}

void main()
