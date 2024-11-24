from pyflink.common import Time, Types
from pyflink.datastream import DataStream, FlatMapFunction
from pyflink.datastream.connectors.kafka import FlinkKafkaProducer
from pyflink.datastream.formats.avro import AvroRowSerializationSchema
from pyflink.datastream.functions import ProcessWindowFunction, RuntimeContext
from pyflink.datastream.state import ValueStateDescriptor
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.table import Row


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
        from utils import EMA

        prev_window_state = self.previous_window_ema_state.value()

        # Happens at init where we define the emaj = 0
        if prev_window_state is None:
            prev_window_state = (0.0, 0.0)

        prev_win_emaj_38, prev_win_emaj_100 = prev_window_state

        latest_trade_timestamp = 0
        latest_trade_price = 0

        for element in elements:
            timestamp = element["timestamp"].timestamp()
            if timestamp > latest_trade_timestamp:
                latest_trade_timestamp = timestamp
                latest_trade_price = element["lasttradeprice"]

        curr_win_emaj_38 = EMA.calulcate_EMA(latest_trade_price, 38, prev_win_emaj_38)
        curr_win_emaj_100 = EMA.calulcate_EMA(
            latest_trade_price, 100, prev_win_emaj_100
        )

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


def handle_trade_event_stream(tradeEventStream: DataStream):
    from utils import avro, kafka

    buy_sell_kafka_producer = FlinkKafkaProducer(
        topic=kafka.BUY_SELL_ADVICE_TOPIC,
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=avro.BUYSELL_EVENT_SCHEMA
        ),
        producer_config=kafka.KAFKA_PROPERTIES,
    )

    ema_kafka_producer = FlinkKafkaProducer(
        topic="ema_results",
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=avro.EMA_RESULT_EVENT_SCHEMA
        ),
        producer_config=kafka.KAFKA_PROPERTIES,
    )

    ema_windowed_stream = (
        tradeEventStream.key_by(lambda x: x["symbol"])
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
