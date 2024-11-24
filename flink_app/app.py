import logging
import sys

from pyflink.common import Duration
from pyflink.common.watermark_strategy import TimestampAssigner, WatermarkStrategy
from pyflink.datastream import StreamExecutionEnvironment, TimeCharacteristic
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer
from pyflink.datastream.formats.avro import AvroRowDeserializationSchema
from utils.avro import TRADE_EVENT_SCHEMA
from utils.kafka import KAFKA_PROPERTIES, TRADE_DATA_TOPIC

from flink_app.pipelines import trade_data_to_ema_and_buy_sell_advice


class TradeDataTimestampAssigner(TimestampAssigner):

    def extract_timestamp(self, value, record_timestamp):
        # Avro serialization converts to datetime object
        dt = value["timestamp"]
        timestamp_in_ms = dt.timestamp() * 1000
        return timestamp_in_ms


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(message)s")

    env = StreamExecutionEnvironment.get_execution_environment()
    env.set_stream_time_characteristic(TimeCharacteristic.EventTime)

    deserialization_schema = AvroRowDeserializationSchema(
        avro_schema_string=TRADE_EVENT_SCHEMA
    )

    consumer = FlinkKafkaConsumer(
        topics=TRADE_DATA_TOPIC,
        deserialization_schema=deserialization_schema,
        properties=KAFKA_PROPERTIES,
    )

    consumer.set_start_from_earliest()

    watermark_strategy = WatermarkStrategy.for_bounded_out_of_orderness(
        Duration.of_seconds(20)
    ).with_timestamp_assigner(TradeDataTimestampAssigner())

    data_source = env.add_source(consumer).assign_timestamps_and_watermarks(
        watermark_strategy
    )

    trade_data_to_ema_and_buy_sell_advice.handle_trade_event_stream(data_source)

    env.execute()
