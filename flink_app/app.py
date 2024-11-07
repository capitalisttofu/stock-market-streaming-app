import logging
import sys

from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer
from pyflink.datastream.formats.avro import (
    AvroRowDeserializationSchema,
)


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(message)s")

    env = StreamExecutionEnvironment.get_execution_environment()

    kafka_properties = {
        "bootstrap.servers": "kafka-0:9092",
        "group.id": "flink_consumer_group",
    }

    deserialization_schema = AvroRowDeserializationSchema(
        avro_schema_string="""
{
  "type": "record",
  "name": "TradeEvent",
  "fields": [
    { "name": "id", "type": "string" },
    { "name": "symbol", "type": "string" },
    { "name": "exchange", "type": "string" },
    {
      "name": "kind",
      "type": { "type": "enum", "name": "SecType", "symbols": ["I", "E"] }
    },
    {
      "name": "lasttradeprice",
      "type": "float"
    }
  ]
}
"""
    )

    consumer = FlinkKafkaConsumer(
        topics="trade_data",
        deserialization_schema=deserialization_schema,
        properties=kafka_properties,
    )
    consumer.set_start_from_earliest()

    data_source = env.add_source(consumer)

    data_source.print()

    env.execute()
