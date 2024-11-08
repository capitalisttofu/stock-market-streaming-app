import * as avro from 'avsc'
// For valid types https://avro.apache.org/docs/1.11.1/specification/

// TODO: Add dates and timestamps using logicalTypes
export const TradeEventAvro = avro.Type.forSchema({
  type: 'record',
  name: 'TradeEvent',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'symbol', type: 'string' },
    { name: 'exchange', type: 'string' },
    {
      name: 'sectype',
      type: { type: 'enum', name: 'SecType', symbols: ['I', 'E'] },
    },
    {
      name: 'lasttradeprice',
      type: 'float',
    },
  ],
})

export const BuySellEventAvro = avro.Type.forSchema({
  type: 'record',
  name: 'BuySellEvent',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'symbol', type: 'string' },
    { name: 'exchange', type: 'string' },
    {
      name: 'buy_or_sell_action',
      type: { type: 'enum', name: 'BuyOrSell', symbols: ['B', 'S'] },
    },
  ],
})
