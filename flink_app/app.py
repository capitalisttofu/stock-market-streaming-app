import logging
import sys

from pyflink.datastream import StreamExecutionEnvironment, TimeCharacteristic
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer
from pyflink.datastream.formats.avro import AvroRowDeserializationSchema
from utils.avro import RAW_TRADE_EVENT_SCHEMA
from utils.kafka import KAFKA_PROPERTIES, SORTED_RAW_TRADE_DATA_TOPIC
from pipelines import (
    trade_data_to_ema_and_buy_sell_advice,
    raw_trade_data_to_trade_events_and_discarded,
)


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(message)s")

    env = StreamExecutionEnvironment.get_execution_environment()
    env.set_stream_time_characteristic(TimeCharacteristic.EventTime)

    deserialization_schema = AvroRowDeserializationSchema(
        avro_schema_string=RAW_TRADE_EVENT_SCHEMA
    )

    raw_trade_event_consumer = FlinkKafkaConsumer(
        topics=SORTED_RAW_TRADE_DATA_TOPIC,
        deserialization_schema=deserialization_schema,
        properties=KAFKA_PROPERTIES,
    )

    raw_trade_event_consumer.set_start_from_earliest()

    data_source = env.add_source(raw_trade_event_consumer)

    trade_event_stream = (
        raw_trade_data_to_trade_events_and_discarded.handle_raw_trade_stream(
            data_source
        )
    )

    trade_data_to_ema_and_buy_sell_advice.handle_trade_event_stream(trade_event_stream)

    env.execute()
