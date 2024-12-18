from pyflink.common import Time, Types
from pyflink.datastream import DataStream, FlatMapFunction, OutputTag
from pyflink.datastream.connectors.kafka import FlinkKafkaProducer
from pyflink.datastream.formats.avro import AvroRowSerializationSchema
from pyflink.datastream.functions import (
    ProcessWindowFunction,
    RuntimeContext,
    ReduceFunction,
)
from pyflink.datastream.state import ValueStateDescriptor
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.table import Row


# Annoyingly, need to for now copy-paste this type definition
# as the import doesnt work nicely when not in a function
# and pyflink errors if this is inside a function
late_events_tag = OutputTag(
    "late-trade-events",
    Types.ROW_NAMED(
        [
            "id",
            "symbol",
            "exchange",
            "sectype",
            "lasttradeprice",
            "timestamp",
            "created_at_timestamp",
        ],
        [
            Types.STRING(),
            Types.STRING(),
            Types.STRING(),
            Types.STRING(),
            Types.FLOAT(),
            Types.LONG(),
            Types.LONG(),
        ],
    ),
)


def calulcate_EMA(last_price: float, j: int, prev_window_ema_for_j: float):
    smoothing_factor_multiplier = 2 / (1 + j)
    return last_price * smoothing_factor_multiplier + prev_window_ema_for_j * (
        1 - smoothing_factor_multiplier
    )


class LatestEventReducer(ReduceFunction):
    def reduce(self, value1, value2):
        # Compare timestamps and return the latest event
        return value1 if value1["timestamp"] > value2["timestamp"] else value2


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
                ema_created_at_timestamp=value["created_at_timestamp"],
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

    def process(
        self, key, ctx: ProcessWindowFunction.Context, latest_trade_event_iterable
    ):
        from utils import time_helpers

        prev_window_state = self.previous_window_ema_state.value()

        # Happens at init where we define the emaj = 0
        if prev_window_state is None:
            prev_window_state = (0.0, 0.0)

        prev_win_emaj_38, prev_win_emaj_100 = prev_window_state

        latest_trade_price = 0
        try:
            # Attempt to retrieve the first (and only) element from the iterable
            latest_trade_event = next(iter(latest_trade_event_iterable))
            latest_trade_price = latest_trade_event["lasttradeprice"]

        except StopIteration:
            latest_trade_price = 0

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
            created_at_timestamp=time_helpers.get_current_timestamp(),
        )

        yield row


def handle_stream(trade_event_stream: DataStream):
    from utils import avro, kafka, flink_types

    windowed_stream = (
        trade_event_stream.key_by(lambda x: x["symbol"])
        .window(TumblingEventTimeWindows.of(Time.seconds(60 * 5)))
        .side_output_late_data(late_events_tag)
    )

    ema_windowed_stream = windowed_stream.reduce(
        LatestEventReducer(),
        window_function=EMACalulaterProcessWindowFunction(),
        output_type=flink_types.EMA_EVENT_TYPE,
    ).name("Reduce: ComputeEMA from LatestTradeEvent")

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

    ema_windowed_stream.add_sink(ema_kafka_producer).name("Kafka Sink: EMAEvents")

    buy_sell_events_stream = ema_windowed_stream.flat_map(
        FilterAndMapToBuySellEventFunction(),
        output_type=flink_types.BUYSELL_EVENT_TYPE,
    ).name("FlatMap: EMA to BuySellEvents")

    buy_sell_events_stream.add_sink(buy_sell_kafka_producer).name(
        "Kafka Sink: BuySellEvents"
    )

    late_events_stream = ema_windowed_stream.get_side_output(late_events_tag)

    late_events_kafka_producer = FlinkKafkaProducer(
        topic=kafka.LATE_TRADE_EVENTS_TOPIC,
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=avro.TRADE_EVENT_SCHEMA
        ),
        producer_config=kafka.KAFKA_PROPERTIES,
    )
    late_events_stream.add_sink(late_events_kafka_producer).name(
        "Kafka Sink: LateTradeEvents"
    )
