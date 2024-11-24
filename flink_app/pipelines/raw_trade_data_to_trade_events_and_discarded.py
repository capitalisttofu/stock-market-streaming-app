from datetime import datetime, timedelta

from pyflink.common import Duration, Types
from pyflink.common.watermark_strategy import TimestampAssigner, WatermarkStrategy
from pyflink.datastream import DataStream, OutputTag
from pyflink.datastream.connectors.kafka import FlinkKafkaProducer
from pyflink.datastream.formats.avro import AvroRowSerializationSchema
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


def compute_timestamp(last_update_time: int, last_trade_date: int):
    # Convert lastTradeDate (days since epoch) to a datetime
    trade_date = datetime(1970, 1, 1) + timedelta(days=last_trade_date)

    # Convert lastUpdateTime (milliseconds since midnight) to a timedelta
    update_time = timedelta(milliseconds=last_update_time)

    # Combine the date and time to create the final datetime
    combined_datetime = trade_date + update_time

    # Return the Unix timestamp (milliseconds since epoch)
    return int(combined_datetime.timestamp() * 1000)


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
        timestamp = compute_timestamp(value["tradingtime"], value["tradingdate"])

        print("timestamp", timestamp)

        row = Row(
            id=value["id"],
            symbol=symbol,
            exchange=exchange,
            sectype=value["sectype"],
            lasttradeprice=value["lasttradeprice"],
            timestamp=timestamp,
        )

        yield row


class TradeDataTimestampAssigner(TimestampAssigner):

    def extract_timestamp(self, value, record_timestamp):
        # Avro serialization converts to datetime object
        timestamp = value["timestamp"]
        return timestamp


def handle_raw_trade_stream(raw_trade_event_stream: DataStream) -> DataStream:
    from utils import avro, kafka

    trade_event_stream = raw_trade_event_stream.process(
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

    watermark_strategy = WatermarkStrategy.for_bounded_out_of_orderness(
        Duration.of_seconds(20)
    ).with_timestamp_assigner(TradeDataTimestampAssigner())

    watermarked_trade_event_stream = (
        trade_event_stream.assign_timestamps_and_watermarks(watermark_strategy)
    )

    trade_event_kafka_producer = FlinkKafkaProducer(
        topic=kafka.TRADE_DATA_TOPIC,
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=avro.TRADE_EVENT_SCHEMA
        ),
        producer_config=kafka.KAFKA_PROPERTIES,
    )

    watermarked_trade_event_stream.add_sink(trade_event_kafka_producer)

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

    return watermarked_trade_event_stream
