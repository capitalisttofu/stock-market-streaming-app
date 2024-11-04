import { ParsedTradeEvent } from '.'
import { TradeEvent } from '../../generatedProto/compiled'
import { TRADE_DATA_TOPIC } from '../constants'
import { producer } from '../lib/kafka'

export const produceTradeData = (datapoint: ParsedTradeEvent) => {
  try {
    const encoded = TradeEvent.encode(datapoint).finish()
    const buffer = Buffer.from(encoded)

    producer.send({
      topic: TRADE_DATA_TOPIC,
      // All messages with same symbol go to the same partition
      messages: [{ value: buffer, key: datapoint.symbol }],
    })
  } catch (e) {
    console.log('Error occured')
    console.log(e)
  }
}
