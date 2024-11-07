import logging
import sys

from pyflink.common.serialization import SimpleStringSchema
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

"""
import logging
import sys
import messages_pb2  # Module not found

print(messages_pb2)

from google.protobuf.timestamp_pb2 import Timestamp
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer
from pyflink.common.serialization import DeserializationSchema, SimpleStringSchema

# docker cp flink_app/messages_pb2.py stock-market-jobmanager:/

if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(message)s")

    env = StreamExecutionEnvironment.get_execution_environment()

    kafka_properties = {
        "bootstrap.servers": "kafka-0:9092",
        "group.id": "flink_consumer_group",
    }

    consumer = FlinkKafkaConsumer(
        topics="trade_data",
        deserialization_schema=SimpleStringSchema(),
        properties=kafka_properties,
    )
    consumer.set_start_from_earliest()

    data_source = env.add_source(consumer)

    def deserialize_protobuf(byte_data):
        trade_event = messages_pb2.TradeEvent()
        trade_event.ParseFromString(byte_data)
        return trade_event

    # TODO: convert protobuf
    deserialized_stream = data_source.map(
        lambda byte_data: deserialize_protobuf(byte_data)
    )
    # deserialized_stream.map(lambda event: process_trade_event(event))

    data_source.print()

    env.execute()
"""
