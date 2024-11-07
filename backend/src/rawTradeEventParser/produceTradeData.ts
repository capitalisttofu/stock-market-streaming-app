import { ParsedTradeEvent } from '.'
import { SecType } from '../../generatedProto/compiled'
import { TRADE_DATA_TOPIC } from '../constants'
import { TradeEventAvro } from '../lib/avro'
import { producer } from '../lib/kafka'

export const produceTradeData = (datapoint: ParsedTradeEvent) => {
  try {
    const buffer = TradeEventAvro.toBuffer({
      id: datapoint.id,
      symbol: datapoint.symbol,
      exchange: datapoint.exchange,
      kind: datapoint.sectype === SecType.E ? 'E' : 'I',
      lasttradeprice: datapoint.lasttradeprice,
    })

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
