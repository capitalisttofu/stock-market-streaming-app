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
      name: 'kind',
      type: { type: 'enum', name: 'SecType', symbols: ['I', 'E'] },
    },
    {
      name: 'lasttradeprice',
      type: 'float',
    },
  ],
})

/*
const buf = type.toBuffer({kind: 'CAT', name: 'Albert'}); // Encoded buffer.
const val = type.fromBuffer(buf); // = {kind: 'CAT', name: 'Albert'}

*/
