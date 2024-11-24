TRADE_EVENT_SCHEMA = """
{
  "type": "record",
  "name": "TradeEvent",
  "fields": [
    { "name": "id", "type": "string" },
    { "name": "symbol", "type": "string" },
    { "name": "exchange", "type": "string" },
    {
      "name": "sectype",
      "type": "string"
    },
    { "name": "lasttradeprice", "type": "float" },
    {
      "name": "timestamp",
      "type": { "type": "long"}
    }
  ]
}
"""

RAW_TRADE_EVENT_SCHEMA = """
{
  "type": "record",
  "name": "RawTradeEvent",
  "fields": [
    {
      "name": "id",
      "type": "string"
    },
    {
      "name": "sectype",
      "type": "string"
    },
    {
      "name": "lasttradeprice",
      "type": ["null", "float"],
      "default": null
    },
    {
      "name": "tradingtime",
      "type": ["null", "int"],
      "default": null
    },
    {
      "name": "tradingdate",
      "type": ["null", "int"],
      "default": null
    }
  ]
}
"""


BUYSELL_EVENT_SCHEMA = """
{
  "type": "record",
  "name": "BuySellEvent",
  "fields": [
    { "name": "emaj_38", "type": "float" },
    { "name": "emaj_100", "type": "float" },
    { "name": "prev_emaj_38", "type": "float" },
    { "name": "prev_emaj_100", "type": "float" },
    { "name": "symbol", "type": "string" },
    {
      "name": "window_start",
      "type": "long"
    },
    {
      "name": "window_end",
      "type": "long"
    },
    {
      "name": "buy_or_sell_action",
      "type": "string"
    }
  ]
}
"""

EMA_RESULT_EVENT_SCHEMA = """
{
  "type": "record",
  "name": "EMAResultEvent",
  "fields": [
    { "name": "emaj_38", "type": "float" },
    { "name": "emaj_100", "type": "float" },
    { "name": "prev_emaj_38", "type": "float" },
    { "name": "prev_emaj_100", "type": "float" },
    { "name": "symbol", "type": "string" },
    {
      "name": "window_start",
      "type": "long"
    },
    {
      "name": "window_end",
      "type": "long"
    }
  ]
}
"""
