from pyflink.common import Types
from pyflink.datastream import DataStream, OutputTag
from pyflink.datastream.connectors.kafka import FlinkKafkaProducer
from pyflink.datastream.formats.avro import (
    AvroRowSerializationSchema,
)
from pyflink.datastream.functions import ProcessFunction
from pyflink.table import Row

discarded_event_output_tag = OutputTag(
    "discarded-event-output",
    Types.ROW_NAMED(
        [
            "id",
            "sectype",
            "lasttradeprice",
            "tradingtime",
            "tradingdate",
        ],
        [
            Types.STRING(),
            Types.STRING(),
            Types.FLOAT(),
            Types.INT(),
            Types.INT(),
        ],
    ),
)


class ProcessRawTradeEvent(ProcessFunction):
    def process_element(self, value, ctx: ProcessFunction.Context):
        # Missing the values we want
        if (
            value["tradingdate"] is None
            or value["lasttradeprice"] is None
            or value["tradingtime"] is None
        ):
            yield discarded_event_output_tag, value
            return

        symbol, exchange = value["id"].split(".")
        # Our timestamp assigner has already calcualted this
        timestamp = ctx.timestamp()

        row = Row(
            id=value["id"],
            symbol=symbol,
            exchange=exchange,
            sectype=value["sectype"],
            lasttradeprice=value["lasttradeprice"],
            timestamp=timestamp,
        )

        yield row


def handle_stream(raw_data_event_stream: DataStream) -> DataStream:
    from utils import avro, kafka

    trade_event_stream = raw_data_event_stream.process(
        ProcessRawTradeEvent(),
        output_type=Types.ROW_NAMED(
            [
                "id",
                "symbol",
                "exchange",
                "sectype",
                "lasttradeprice",
                "timestamp",
            ],
            [
                Types.STRING(),
                Types.STRING(),
                Types.STRING(),
                Types.STRING(),
                Types.FLOAT(),
                Types.LONG(),
            ],
        ),
    )

    discarded_event_stream = trade_event_stream.get_side_output(
        discarded_event_output_tag
    )

    discarded_event_kafka_producer = FlinkKafkaProducer(
        topic=kafka.DISCARDED_DATA_TOPIC,
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=avro.RAW_TRADE_EVENT_SCHEMA
        ),
        producer_config=kafka.KAFKA_PROPERTIES,
    )

    discarded_event_stream.add_sink(discarded_event_kafka_producer)

    trade_event_kafka_producer = FlinkKafkaProducer(
        topic=kafka.TRADE_DATA_TOPIC,
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=avro.TRADE_EVENT_SCHEMA
        ),
        producer_config=kafka.KAFKA_PROPERTIES,
    )

    trade_event_stream.add_sink(trade_event_kafka_producer)

    return trade_event_stream
