import { ParsedTradeEvent } from '.'
import { TRADE_DATA_TOPIC } from '../constants'
import { TradeEventAvro } from '../lib/avro'
import { producer } from '../lib/kafka'

const daysToMilliseconds = (days: number) => {
  return days * 24 * 60 * 60 * 1000
}

export const produceTradeData = (datapoint: ParsedTradeEvent) => {
  try {
    const timestamp = new Date(
      datapoint.lastUpdateTime + daysToMilliseconds(datapoint.lastTradeDate),
    ).getTime()

    const buffer = TradeEventAvro.toBuffer({
      id: datapoint.id,
      symbol: datapoint.symbol,
      exchange: datapoint.exchange,
      sectype: datapoint.sectype,
      lasttradeprice: datapoint.lastTradePrice,
      timestamp,
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
