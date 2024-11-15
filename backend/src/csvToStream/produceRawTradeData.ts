import { ParsedRawData } from '.'
import { SORTED_RAW_TRADE_DATA_TOPIC } from '../constants'
import { RawTradeEventAvro } from '../lib/avro'
import { producer } from '../lib/kafka'

export const produceRawTradeData = async (datapoints: ParsedRawData[]) => {
  const messages = datapoints.map((datapoint) => {
    const buffer = RawTradeEventAvro.toBuffer({
      id: datapoint.id,
      sectype: datapoint.secType,
      lasttradeprice: datapoint.lastTradePrice,
      tradingtime: datapoint.tradingTime,
      tradingdate: datapoint.tradingDate,
    })

    return { value: buffer }
  })

  await producer.send({
    topic: SORTED_RAW_TRADE_DATA_TOPIC,
    // Adding a key to the message object here
    // would result in it being used in the partitioning logic
    // where all messages with same key go to same partition
    messages,
  })
}
