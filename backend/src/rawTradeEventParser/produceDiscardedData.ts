import { DISCARDED_DATA_TOPIC } from '../constants'
import { producer } from '../lib/kafka'

export const produceDiscardedData = (buffer: Buffer) => {
  try {
    producer.send({
      topic: DISCARDED_DATA_TOPIC,
      messages: [{ value: buffer }],
    })
  } catch (e) {
    console.log('Error occured')
    console.log(e)
  }
}
