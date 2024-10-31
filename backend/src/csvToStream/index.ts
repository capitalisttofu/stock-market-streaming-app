import { SecType } from '../../generatedProto/compiled'
import { producer } from '../lib/kafka'
import { produceRawTradeData } from './produceRawTradeData'

export type ParsedRawData = {
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
      await produceRawTradeData(datapoint)
    }
    console.log('All messages produced successfully')
  } catch (e) {
    console.log('Error occured')
    console.log(e)
  } finally {
    await producer.disconnect()
    process.exit()
  }
}

void main()
