import logging
import sys
from datetime import datetime, timedelta

from pipelines import (
    raw_trade_data_to_trade_events_and_discarded,
    trade_data_to_ema_and_buy_sell_advice,
)
from pyflink.common import Duration
from pyflink.common.watermark_strategy import TimestampAssigner, WatermarkStrategy
from pyflink.datastream import StreamExecutionEnvironment, TimeCharacteristic
from pyflink.datastream.connectors.kafka import FlinkKafkaConsumer
from pyflink.datastream.formats.avro import AvroRowDeserializationSchema
from utils import avro
from utils import kafka
from pyflink.common import Duration, Types

from pyflink.datastream import DataStream, OutputTag
from pyflink.datastream.connectors.kafka import FlinkKafkaProducer
from pyflink.datastream.formats.avro import AvroRowSerializationSchema
from pyflink.datastream.functions import ProcessFunction
from pyflink.table import Row
from pyflink.common import Time, Types
from pyflink.datastream import DataStream, FlatMapFunction
from pyflink.datastream.connectors.kafka import FlinkKafkaProducer
from pyflink.datastream.formats.avro import AvroRowSerializationSchema
from pyflink.datastream.functions import ProcessWindowFunction, RuntimeContext
from pyflink.datastream.state import ValueStateDescriptor
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.table import Row
from pyflink.datastream import TimeCharacteristic


def calulcate_EMA(last_price: float, j: int, prev_window_ema_for_j: float):
    smoothing_factor_multiplier = 2 / (1 + j)
    return last_price * smoothing_factor_multiplier + prev_window_ema_for_j * (
        1 - smoothing_factor_multiplier
    )


class FilterAndMapToBuySellEventFunction(FlatMapFunction):
    def flat_map(self, value):
        buy_or_sell_action = None

        if (
            value["emaj_38"] > value["emaj_100"]
            and value["prev_emaj_38"] <= value["prev_emaj_100"]
        ):
            buy_or_sell_action = "BUY"

        if (
            value["emaj_38"] < value["emaj_100"]
            and value["prev_emaj_38"] >= value["prev_emaj_100"]
        ):
            buy_or_sell_action = "SELL"

        if buy_or_sell_action is not None:
            row = Row(
                emaj_38=value["emaj_38"],
                emaj_100=value["emaj_100"],
                prev_emaj_38=value["prev_emaj_38"],
                prev_emaj_100=value["prev_emaj_100"],
                symbol=value["symbol"],
                window_start=value["window_start"],
                window_end=value["window_end"],
                buy_or_sell_action=buy_or_sell_action,
            )
            yield row


class EMACalulaterProcessWindowFunction(ProcessWindowFunction):
    def open(self, runtime_context: RuntimeContext):
        # First ema value in tuple is for smaller j, second is larger j (example 38 and 100)
        self.previous_window_ema_state = runtime_context.get_state(
            ValueStateDescriptor(
                "previous_window_ema_state", Types.TUPLE([Types.FLOAT(), Types.FLOAT()])
            )
        )

    def process(self, key, ctx: ProcessWindowFunction.Context, elements):

        prev_window_state = self.previous_window_ema_state.value()

        # Happens at init where we define the emaj = 0
        if prev_window_state is None:
            prev_window_state = (0.0, 0.0)

        prev_win_emaj_38, prev_win_emaj_100 = prev_window_state

        latest_trade_timestamp = 0
        latest_trade_price = 0

        for element in elements:
            timestamp = element["timestamp"]
            if timestamp > latest_trade_timestamp:
                latest_trade_timestamp = timestamp
                latest_trade_price = element["lasttradeprice"]

        curr_win_emaj_38 = calulcate_EMA(latest_trade_price, 38, prev_win_emaj_38)
        curr_win_emaj_100 = calulcate_EMA(latest_trade_price, 100, prev_win_emaj_100)

        self.previous_window_ema_state.update((curr_win_emaj_38, curr_win_emaj_100))

        window_start_time = ctx.window().start  # Start of the window
        window_end_time = ctx.window().end  # End of the window

        row = Row(
            emaj_38=curr_win_emaj_38,
            emaj_100=curr_win_emaj_100,
            prev_emaj_38=prev_win_emaj_38,
            prev_emaj_100=prev_win_emaj_100,
            symbol=key,  # We keyBy symbol
            window_start=window_start_time,
            window_end=window_end_time,
        )

        yield row


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
            return 0

        timestamp = compute_timestamp(value["tradingtime"], value["tradingdate"])
        return timestamp


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(message)s")

    env = StreamExecutionEnvironment.get_execution_environment()
    env.set_stream_time_characteristic(TimeCharacteristic.EventTime)

    deserialization_schema = AvroRowDeserializationSchema(
        avro_schema_string=avro.RAW_TRADE_EVENT_SCHEMA
    )

    raw_trade_event_consumer = FlinkKafkaConsumer(
        topics=kafka.SORTED_RAW_TRADE_DATA_TOPIC,
        deserialization_schema=deserialization_schema,
        properties=kafka.KAFKA_PROPERTIES,
    )

    watermark_strategy = WatermarkStrategy.for_bounded_out_of_orderness(
        Duration.of_seconds(20)
    ).with_timestamp_assigner(RawTradeDataTimestampAssigner())

    raw_trade_event_consumer.set_start_from_earliest()

    data_source = env.add_source(
        raw_trade_event_consumer
    ).assign_timestamps_and_watermarks(watermark_strategy)

    trade_event_stream = data_source.process(
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

    ema_windowed_stream = (
        trade_event_stream.key_by(lambda x: x["symbol"])
        .window(TumblingEventTimeWindows.of(Time.seconds(60 * 5)))
        .process(
            EMACalulaterProcessWindowFunction(),
            output_type=Types.ROW_NAMED(
                [
                    "emaj_38",
                    "emaj_100",
                    "prev_emaj_38",
                    "prev_emaj_100",
                    "symbol",
                    "window_start",
                    "window_end",
                ],
                [
                    Types.FLOAT(),
                    Types.FLOAT(),
                    Types.FLOAT(),
                    Types.FLOAT(),
                    Types.STRING(),
                    Types.LONG(),
                    Types.LONG(),
                ],
            ),
        )
    )

    buy_sell_kafka_producer = FlinkKafkaProducer(
        topic=kafka.BUY_SELL_ADVICE_TOPIC,
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=avro.BUYSELL_EVENT_SCHEMA
        ),
        producer_config=kafka.KAFKA_PROPERTIES,
    )

    ema_kafka_producer = FlinkKafkaProducer(
        topic=kafka.EMA_RESULTS_TOPIC,
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=avro.EMA_RESULT_EVENT_SCHEMA
        ),
        producer_config=kafka.KAFKA_PROPERTIES,
    )

    ema_windowed_stream.add_sink(ema_kafka_producer)

    buy_sell_events_stream = ema_windowed_stream.flat_map(
        FilterAndMapToBuySellEventFunction(),
        output_type=Types.ROW_NAMED(
            [
                "emaj_38",
                "emaj_100",
                "prev_emaj_38",
                "prev_emaj_100",
                "symbol",
                "window_start",
                "window_end",
                "buy_or_sell_action",
            ],
            [
                Types.FLOAT(),
                Types.FLOAT(),
                Types.FLOAT(),
                Types.FLOAT(),
                Types.STRING(),
                Types.LONG(),
                Types.LONG(),
                Types.STRING(),
            ],
        ),
    )

    buy_sell_events_stream.add_sink(buy_sell_kafka_producer)

    trade_event_kafka_producer = FlinkKafkaProducer(
        topic=kafka.TRADE_DATA_TOPIC,
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=avro.TRADE_EVENT_SCHEMA
        ),
        producer_config=kafka.KAFKA_PROPERTIES,
    )

    trade_event_stream.add_sink(trade_event_kafka_producer)

    env.execute()
