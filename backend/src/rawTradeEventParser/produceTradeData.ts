import { ParsedTradeEvent } from '.'
import { TRADE_DATA_TOPIC } from '../constants'
import { TradeEventAvro } from '../lib/avro'
import { producer } from '../lib/kafka'

export const produceTradeData = (datapoint: ParsedTradeEvent) => {
  try {
    const buffer = TradeEventAvro.toBuffer({
      id: datapoint.id,
      symbol: datapoint.symbol,
      exchange: datapoint.exchange,
      sectype: datapoint.sectype,
      lasttradeprice: datapoint.lastTradePrice,
      lastupdatetime: datapoint.lastUpdateTime,
      lasttradedate: datapoint.lastTradeDate,
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
