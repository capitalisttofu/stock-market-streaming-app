KAFKA_PROPERTIES = {
    "bootstrap.servers": "kafka-0:9092",
    "group.id": "flink_consumer_group",
}

SORTED_RAW_TRADE_DATA_TOPIC = "sorted_raw_trade_data"
TRADE_DATA_TOPIC = "trade_data"
BUY_SELL_ADVICE_TOPIC = "buy_sell_advice"
DISCARDED_DATA_TOPIC = "discarded_data"
EMA_RESULTS_TOPIC = "ema_results"
LATE_TRADE_EVENTS_TOPIC = "late_trade_data"
