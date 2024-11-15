import * as env from 'env-var'

// For now assume we are running this locally
const HOST_IP = 'localhost'
export const LOCAL_KAFKA_BROKER_LIST = [`${HOST_IP}:9094`, `${HOST_IP}:9096`]

export const SORTED_RAW_TRADE_DATA_TOPIC = 'sorted_raw_trade_data'
export const TRADE_DATA_TOPIC = 'trade_data'
export const BUY_SELL_ADVICE_TOPIC = 'buy_sell_advice'
export const DISCARDED_DATA_TOPIC = 'discarded_data'
export const EMA_RESULTS_TOPIC = 'ema_results'

export const RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION = env
  .get('RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION')
  .default('false')
  .asBool()

export const WAIT_TIME_DIFFERENCE_BETWEEN_EVENTS = env
  .get('WAIT_TIME_DIFFERENCE_BETWEEN_EVENTS')
  .default('false')
  .asBool()

export const REALTIME_DATA_PRODUCTION_START_HOUR = env
  .get('REALTIME_DATA_PRODUCTION_START_HOUR')
  .default(0)
  .asInt()

export const REALTIME_DATA_PRODUCTION_END_HOUR = env
  .get('REALTIME_DATA_PRODUCTION_END_HOUR')
  .default(24)
  .asInt()

export const rawDataDirectory = 'rawData'
