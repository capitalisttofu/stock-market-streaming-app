import logging
import sys

from datetime import datetime
from pyflink.common import Duration, Time, Types
from pyflink.common.watermark_strategy import TimestampAssigner, WatermarkStrategy
from pyflink.datastream import StreamExecutionEnvironment, TimeCharacteristic
from pyflink.datastream.connectors.kafka import (
    FlinkKafkaConsumer,
    FlinkKafkaProducer,
    KafkaOffsetsInitializer,
    KafkaSource,
)
from pyflink.datastream.formats.avro import (
    AvroRowDeserializationSchema,
    AvroRowSerializationSchema,
)
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.table import Row

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
      "type": { "type": "long", "logicalType": "timestamp-millis" }
    }
  ]
}
"""

# TODO: Fill in once we actually know what we want
BUYSELL_EVENT_SCHEMA = """
{
  "type": "record",
  "name": "BuySellEvent",
  "fields": [
    { "name": "id", "type": "string" },
    { "name": "symbol", "type": "string" },
    { "name": "exchange", "type": "string" },
    {
      "name": "buy_or_sell_action",
      "type": "string"
    }
  ]
}
"""


class TradeDataTimestampAssigner(TimestampAssigner):

    def extract_timestamp(self, value, record_timestamp):
        # Avro serialization converts to datetime object
        dt = value["timestamp"]
        timestamp_in_ms = dt.timestamp() * 1000
        return timestamp_in_ms


def map_trade_to_buysell(trade_event):
    # Define a mapping from "I" -> "B" and "E" -> "S" as an example
    buy_or_sell_action_map = {"I": "B", "E": "S"}

    # Transform TradeEvent to BuySellEvent

    return Row(
        id=trade_event["id"],
        symbol=trade_event["symbol"],
        exchange=trade_event["exchange"],
        buy_or_sell_action=buy_or_sell_action_map.get(trade_event["sectype"], "B"),
    )


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(message)s")

    env = StreamExecutionEnvironment.get_execution_environment()
    env.set_stream_time_characteristic(TimeCharacteristic.EventTime)

    kafka_properties = {
        "bootstrap.servers": "kafka-0:9092",
        "group.id": "flink_consumer_group",
    }

    deserialization_schema = AvroRowDeserializationSchema(
        avro_schema_string=TRADE_EVENT_SCHEMA
    )

    consumer = FlinkKafkaConsumer(
        topics="trade_data",
        deserialization_schema=deserialization_schema,
        properties=kafka_properties,
    )

    consumer.set_start_from_earliest()

    watermark_strategy = WatermarkStrategy.for_bounded_out_of_orderness(
        Duration.of_seconds(20)
    ).with_timestamp_assigner(TradeDataTimestampAssigner())

    data_source = env.add_source(consumer).assign_timestamps_and_watermarks(
        watermark_strategy
    )

    serialization_schema = AvroRowSerializationSchema(
        avro_schema_string=BUYSELL_EVENT_SCHEMA
    )

    kafka_producer = FlinkKafkaProducer(
        topic="buy_sell_advice",
        serialization_schema=serialization_schema,
        producer_config=kafka_properties,
    )

    # Map data from TradeEvent to BuySellEvent
    mapped_stream = data_source.map(
        map_trade_to_buysell,
        output_type=Types.ROW_NAMED(
            ["id", "symbol", "exchange", "buy_or_sell_action"],
            [Types.STRING(), Types.STRING(), Types.STRING(), Types.STRING()],
        ),
    )

    windowed_stream = (
        data_source.key_by(lambda x: x["symbol"])
        .window(TumblingEventTimeWindows.of(Time.seconds(60 * 5)))
        .reduce(
            lambda a, b: Row(
                id=a["id"],
                symbol=a["symbol"],
                exchange=a["exchange"],
                sectype=a["sectype"],
                lasttradeprice=a["lasttradeprice"],
                timestamp=a["timestamp"],
            )
        )
    )
    windowed_stream.print()

    # Produce mapped data to Kafka
    mapped_stream.add_sink(kafka_producer)

    env.execute()
