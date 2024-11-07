import logging
import sys
import messages_pb2 # Module not found

print(messages_pb2)

from google.protobuf.timestamp_pb2 import Timestamp
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer
from pyflink.common.serialization import DeserializationSchema, SimpleStringSchema

# docker cp flink_app/messages_pb2.py stock-market-jobmanager:/
"""
class ProtobufDeserializationSchema(DeserializationSchema):
    def deserialize(self, message: bytes) -> ExampleMessage:
        # Use the generated class from the compiled Protobuf file to parse the message
        example_message = ExampleMessage()
        example_message.ParseFromString(message)
        return example_message

    def is_end_of_stream(self, next_element) -> bool:
        return False

    def get_produced_type(self):
        from pyflink.common import Types
        return Types.PICKLED_BYTE_ARRAY()
        """

"""
def process_trade_event(event: messages_pb2.TradeEvent):
    # Extract and print details from the event
    print(f"Trade Event ID: {event.id}")
    print(f"Symbol: {event.symbol}")
    print(f"Exchange: {event.exchange}")
    print(f"Security Type: {event.sectype}")
    print(f"Last Trade Price: {event.lasttradeprice}")
    print(f"Last Update: {event.lastUpdate}")
    print(f"Last Trade: {event.lastTrade}")"""


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

    def deserialize_protobuf(byte_data):
        trade_event = messages_pb2.TradeEvent()
        trade_event.ParseFromString(byte_data)
        return trade_event

    # TODO: convert protobuf
    deserialized_stream = data_source.map(lambda byte_data: deserialize_protobuf(byte_data))
    #deserialized_stream.map(lambda event: process_trade_event(event))

    data_source.print()

    env.execute()
