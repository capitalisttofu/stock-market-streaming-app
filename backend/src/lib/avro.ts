import * as avro from 'avsc'
// For valid types https://avro.apache.org/docs/1.11.1/specification/

export const RawTradeEventAvro = avro.Type.forSchema({
  type: 'record',
  name: 'RawTradeEvent',
  fields: [
    { name: 'id', type: 'string' },
    {
      name: 'sectype',
      type: 'string',
    },
    {
      name: 'lasttradeprice',
      type: ['null', 'float'],
      default: null,
    },
    {
      name: 'tradingtime',
      type: ['null', { type: 'int', logicalType: 'time-millis' }],
      default: null,
    },
    {
      name: 'tradingdate',
      type: ['null', { type: 'int', logicalType: 'date' }],
      default: null,
    },
  ],
})

export const TradeEventAvro = avro.Type.forSchema({
  type: 'record',
  name: 'TradeEvent',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'symbol', type: 'string' },
    { name: 'exchange', type: 'string' },
    {
      name: 'sectype',
      type: 'string',
    },
    {
      name: 'lasttradeprice',
      type: 'float',
    },
    {
      name: 'timestamp',
      type: { type: 'long', logicalType: 'timestamp-millis' },
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
      type: 'string',
    },
  ],
})

export const EMAResultEventAvro = avro.Type.forSchema({
  type: 'record',
  name: 'EMAResultEvent',
  fields: [
    { name: 'emaj_38', type: 'float' },
    { name: 'emaj_100', type: 'float' },
    { name: 'prev_emaj_38', type: 'float' },
    { name: 'prev_emaj_100', type: 'float' },
    { name: 'symbol', type: 'string' },
    {
      name: 'window_start',
      type: 'long',
    },
    {
      name: 'window_end',
      type: 'long',
    },
  ],
})
