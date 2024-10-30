import * as env from 'env-var'

// For now assume we are running this locally
const HOST_IP = 'localhost'
export const LOCAL_KAFKA_BROKER_LIST = [`${HOST_IP}:9094`, `${HOST_IP}:9096`]

export const SORTED_RAW_TRADE_DATA_TOPIC = 'sorted_raw_trade_data'
export const TRADE_DATA_TOPIC = 'trade_data'
export const BUY_SELL_ADVICE_TOPIC = 'buy_sell_advice'

export const RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION = env
  .get('RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION')
  .default('false')
  .asBool()
