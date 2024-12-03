import * as dotenv from 'dotenv'

dotenv.config()

// For now assume we are running this locally
const HOST_IP = 'localhost'
export const LOCAL_KAFKA_BROKER_LIST = [`${HOST_IP}:9094`, `${HOST_IP}:9096`]

export const SORTED_RAW_TRADE_DATA_TOPIC = 'sorted_raw_trade_data'
export const TRADE_DATA_TOPIC = 'trade_data'

export const LATE_TRADE_EVENTS_TOPIC = 'late_trade_data'

export const BUY_SELL_ADVICE_TOPIC = 'buy_sell_advice'
export const DISCARDED_DATA_TOPIC = 'discarded_data'
export const EMA_RESULTS_TOPIC = 'ema_results'

export const RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION =
  process.env.RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION === 'true'

export const NOW_DATE = process.env.NOW_DATE
export const SKIP_DATE_MODIFICATION =
  process.env.SKIP_DATE_MODIFICATION === 'true'
export const FLINK_PARALELLISM = Number(process.env.FLINK_PARALELLISM)

if (isNaN(FLINK_PARALELLISM)) {
  throw new Error('FLINK PARALLEISM MUST BE NUMBER')
}

export const rawDataDirectory = 'rawData'

export const SKIP_DISCARDED_DATA = process.env.SKIP_DISCARDED_DATA === 'true'
