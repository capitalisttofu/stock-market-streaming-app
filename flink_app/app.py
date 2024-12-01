import logging
import sys
from datetime import datetime, timedelta

from pipelines import (
    raw_trade_data_to_trade_events_and_discarded,
    trade_data_to_ema_and_buy_sell_advice,
)
from pyflink.common import Duration
from pyflink.common.watermark_strategy import TimestampAssigner, WatermarkStrategy
from pyflink.datastream import (
    StreamExecutionEnvironment,
    TimeCharacteristic,
    CheckpointingMode,
)
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer
from pyflink.datastream.formats.avro import AvroRowDeserializationSchema
from utils import avro, kafka


def enable_checkpoints(env: StreamExecutionEnvironment):
    # start a checkpoint every 10 seconds
    env.enable_checkpointing(10 * 1000)

    # set mode to exactly-once (this is the default, but adding here for clarity)
    env.get_checkpoint_config().set_checkpointing_mode(CheckpointingMode.EXACTLY_ONCE)

    env.get_checkpoint_config().set_checkpoint_storage_dir("file:///flink-checkpoints")


def compute_timestamp(last_update_time: int, last_trade_date: int):
    # Convert lastTradeDate (days since epoch) to a datetime
    trade_date = datetime(1970, 1, 1) + timedelta(days=last_trade_date)

    # Convert lastUpdateTime (milliseconds since midnight) to a timedelta
    update_time = timedelta(milliseconds=last_update_time)

    # Combine the date and time to create the final datetime
    combined_datetime = trade_date + update_time

    # Return the Unix timestamp (milliseconds since epoch)
    return int(combined_datetime.timestamp() * 1000)


class RawTradeDataTimestampAssigner(TimestampAssigner):

    def extract_timestamp(self, value, record_timestamp):

        if value["tradingdate"] is None or value["tradingtime"] is None:
            # We discard these later in the side output so doesnt matter
            # That they will all be considered late
            return 0

        timestamp = compute_timestamp(value["tradingtime"], value["tradingdate"])
        return timestamp


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(message)s")

    env = StreamExecutionEnvironment.get_execution_environment()
    # NOTE! Make sure that
    # there are at least as many kafka paritions in the consumed topic as the amount of jobs
    # you are running in parallel, otherwise there will be issues with watermarks
    env.set_parallelism(3)
    env.set_stream_time_characteristic(TimeCharacteristic.EventTime)
    enable_checkpoints(env)

    deserialization_schema = AvroRowDeserializationSchema(
        avro_schema_string=avro.RAW_TRADE_EVENT_SCHEMA
    )

    raw_trade_event_consumer = FlinkKafkaConsumer(
        topics=kafka.SORTED_RAW_TRADE_DATA_TOPIC,
        deserialization_schema=deserialization_schema,
        properties=kafka.KAFKA_PROPERTIES,
    )

    watermark_strategy = WatermarkStrategy.for_bounded_out_of_orderness(
        Duration.of_seconds(30)
    ).with_timestamp_assigner(RawTradeDataTimestampAssigner())

    raw_trade_event_consumer.set_start_from_earliest()

    data_source = (
        env.add_source(raw_trade_event_consumer)
        .name("Kafka Source: RawTradeEvents")
        .assign_timestamps_and_watermarks(watermark_strategy)
        .name("Assign Timestamps and Watermarks")
    )

    trade_event_stream = raw_trade_data_to_trade_events_and_discarded.handle_stream(
        data_source
    )

    trade_data_to_ema_and_buy_sell_advice.handle_stream(trade_event_stream)

    env.execute()
