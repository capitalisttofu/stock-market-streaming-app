import { ParsedRawData } from '.'
import { RawTradeEvent } from '../../generatedProto/compiled'
import { SORTED_RAW_TRADE_DATA_TOPIC } from '../constants'
import { producer } from '../lib/kafka'

export const produceRawTradeData = async (datapoints: ParsedRawData[]) => {
  // Create validates the message, so might be better
  // but it can be more efficient to encode directly
  // leaving this code here for future reference and example
  /*
    const message = RawTradeEvent.create(datapoint)

    const encoded = RawTradeEvent.encode(message).finish()

    const res = RawTradeEvent.decode(encoded)
    console.log(res)
   */

  const messages = datapoints.map((datapoint) => {
    const encoded = RawTradeEvent.encode(datapoint).finish()
    return { value: Buffer.from(encoded) }
  })

  await producer.send({
    topic: SORTED_RAW_TRADE_DATA_TOPIC,
    // Adding a key to the message object here
    // would result in it being used in the partitioning logic
    // where all messages with same key go to same partition
    messages,
  })
}
