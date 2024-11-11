import { RawTradeEvent } from '.'
import { DISCARDED_DATA_TOPIC } from '../constants'
import { RawTradeEventAvro } from '../lib/avro'
import { producer } from '../lib/kafka'

export const produceDiscardedData = (datapoint: RawTradeEvent) => {
  try {
    const buffer = RawTradeEventAvro.toBuffer(datapoint)

    producer.send({
      topic: DISCARDED_DATA_TOPIC,
      messages: [{ value: buffer }],
    })
  } catch (e) {
    console.log('Error occured')
    console.log(e)
  }
}
