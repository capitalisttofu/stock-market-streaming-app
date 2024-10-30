import { ParsedRawData } from '.'
import { RawTradeEvent } from '../../generatedProto/compiled'
import { SORTED_RAW_TRADE_DATA_TOPIC } from '../constants'
import { producer } from '../lib/kafka'

export const produceRawTradeData = async (datapoint: ParsedRawData) => {
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
