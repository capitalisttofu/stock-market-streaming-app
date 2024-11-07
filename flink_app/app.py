import logging
import sys

from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer
from pyflink.common.serialization import SimpleStringSchema


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(message)s")

    env = StreamExecutionEnvironment.get_execution_environment()

    kafka_properties = {
        'bootstrap.servers': 'kafka-0:9092',
        'group.id': 'flink_consumer_group'
    }

    consumer = FlinkKafkaConsumer(
        topics='trade_data',
        deserialization_schema=SimpleStringSchema(),
        properties=kafka_properties
    )
    consumer.set_start_from_earliest()

    data_source = env.add_source(consumer)

    # TODO: convert protobuf

    data_source.print()

    env.execute()
