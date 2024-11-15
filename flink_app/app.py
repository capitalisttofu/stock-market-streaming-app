import logging
import sys
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.datastream import StreamExecutionEnvironment, TimeCharacteristic
from pyflink.datastream.connectors.kafka import (
    FlinkKafkaConsumer,
    FlinkKafkaProducer,
    KafkaSource,
    KafkaOffsetsInitializer,
)
from pyflink.common.watermark_strategy import WatermarkStrategy, TimestampAssigner
from pyflink.datastream.formats.avro import (
    AvroRowDeserializationSchema,
    AvroRowSerializationSchema,
)
from pyflink.common import Types, Duration, Time
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
    { "name": "lasttradeprice", "type": "float" }
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


class FirstElementTimestampAssigner(TimestampAssigner):

    def extract_timestamp(self, value, record_timestamp):
        print("EXTRACTARINIO")
        return value["lasttradeprice"]


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

    data_source = env.add_source(consumer)

    watermark_strategy = WatermarkStrategy.for_bounded_out_of_orderness(
        Duration.of_seconds(20)
    ).with_timestamp_assigner(FirstElementTimestampAssigner())

    serialization_schema = AvroRowSerializationSchema(
        avro_schema_string=BUYSELL_EVENT_SCHEMA
    )

    kafka_producer = FlinkKafkaProducer(
        topic="buy_sell_advice",
        serialization_schema=serialization_schema,
        producer_config=kafka_properties,
    )

    # Map data from TradeEvent to BuySellEvent
    #  mapped_stream = data_source.map(
    #     map_trade_to_buysell,
    #     output_type=Types.ROW_NAMED(
    #         ["id", "symbol", "exchange", "buy_or_sell_action"],
    #         [Types.STRING(), Types.STRING(), Types.STRING(), Types.STRING()],
    #     ),
    # )

    e = data_source.assign_timestamps_and_watermarks(watermark_strategy)

    windowed_stream = (
        e.key_by(lambda x: x["symbol"])
        .window(TumblingEventTimeWindows.of(Time.seconds(10)))
        .reduce(
            lambda a, b: Row(
                id=a["id"],
                symbol=a["symbol"],
                exchange=a["exchange"],
                sectype=a["sectype"],
                lasttradeprice=a["lasttradeprice"],
            )
        )
    )
    # windowed_stream.print()
    # mapped_stream.print()
    # Produce mapped data to Kafka
    #     mapped_stream.add_sink(kafka_producer)

    env.execute()
