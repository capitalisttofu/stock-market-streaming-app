import { RawTradeEvent } from '../../generatedProto/compiled'
import { DISCARDED_DATA_TOPIC } from '../constants'
import { producer } from '../lib/kafka'

export const produceDiscardedData = async (datapoint: RawTradeEvent) => {
  try {
    const encoded = RawTradeEvent.encode(datapoint).finish()
    const buffer = Buffer.from(encoded)

    console.log("Data point discarded")

    await producer.send({
      topic: DISCARDED_DATA_TOPIC,
      messages: [{ value: buffer }],
    })
  } catch (e) {
    console.log('Error occured')
    console.log(e)
  }
}
