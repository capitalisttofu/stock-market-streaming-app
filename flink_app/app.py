import logging
import sys

from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer, FlinkKafkaProducer
from pyflink.datastream.formats.avro import (
    AvroRowDeserializationSchema,
    AvroRowSerializationSchema,
)
from pyflink.common import Types
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
      "name": "lastupdatetime",
      "type": { "type": "int", "logicalType": "time-millis" }
    },
    {
      "name": "lasttradedate",
      "type": { "type": "int", "logicalType": "date" }
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
    mapped_stream.print()
    # Produce mapped data to Kafka
    mapped_stream.add_sink(kafka_producer)

    env.execute()
