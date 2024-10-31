import { RawTradeEvent } from '../../generatedProto/compiled'
import { TRADE_DATA_TOPIC } from '../constants'
import { producer } from '../lib/kafka'

export const produceTradeData = async (datapoint: RawTradeEvent) => {
  try {
    const encoded = RawTradeEvent.encode(datapoint).finish()
    const buffer = Buffer.from(encoded)

    const symbol = datapoint.id.split(".")[0]

    await producer.send({
      topic: TRADE_DATA_TOPIC,
      // All messages with same symbol go to the same partition
      messages: [{ value: buffer, key: symbol }],
    })
  } catch (e) {
    console.log('Error occured')
    console.log(e)
  }
}
