import logging
import sys

from datetime import datetime
from pyflink.common import Duration, Time, Types
from pyflink.common.watermark_strategy import TimestampAssigner, WatermarkStrategy
from pyflink.datastream import (
    StreamExecutionEnvironment,
    TimeCharacteristic,
    FlatMapFunction,
)
from pyflink.datastream.connectors.kafka import (
    FlinkKafkaConsumer,
    FlinkKafkaProducer,
)
from pyflink.datastream.formats.avro import (
    AvroRowDeserializationSchema,
    AvroRowSerializationSchema,
)
from pyflink.datastream.state import ValueStateDescriptor
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.table import Row
from pyflink.datastream.functions import (
    ProcessWindowFunction,
    RuntimeContext,
)

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
      "name": "timestamp",
      "type": { "type": "long", "logicalType": "timestamp-millis" }
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
    { "name": "symbol", "type": "string" },
    {
      "name": "buy_or_sell_action",
      "type": "string"
    },
    {
      "name": "window_end",
      "type": "long"
    }
  ]
}
"""

EMA_RESULT_EVENT_SCHEMA = """
{
  "type": "record",
  "name": "EMAResultEvent",
  "fields": [
    { "name": "emaj_38", "type": "float" },
    { "name": "emaj_100", "type": "float" },
    { "name": "prev_emaj_38", "type": "float" },
    { "name": "prev_emaj_100", "type": "float" },
    { "name": "symbol", "type": "string" },
    {
      "name": "window_start",
      "type": "long"
    },
    {
      "name": "window_end",
      "type": "long"
    }
  ]
}
"""


class FilterAndMapToBuySellEventFunction(FlatMapFunction):
    def flat_map(self, value):
        # Filter condition: keep only elements where "amount" > 10
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
                symbol=value["symbol"],
                buy_or_sell_action=buy_or_sell_action,
                window_end=value["window_end"],
            )
            yield row


def calulcate_EMA(last_price: float, j: int, prev_window_ema_for_j: float):
    smoothing_factor_multiplier = 2 / (1 + j)
    return last_price * smoothing_factor_multiplier + prev_window_ema_for_j * (
        1 - smoothing_factor_multiplier
    )


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
            timestamp = element["timestamp"].timestamp()
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


class TradeDataTimestampAssigner(TimestampAssigner):

    def extract_timestamp(self, value, record_timestamp):
        # Avro serialization converts to datetime object
        dt = value["timestamp"]
        timestamp_in_ms = dt.timestamp() * 1000
        return timestamp_in_ms


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(message)s")

    env = StreamExecutionEnvironment.get_execution_environment()
    env.set_stream_time_characteristic(TimeCharacteristic.EventTime)

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

    watermark_strategy = WatermarkStrategy.for_bounded_out_of_orderness(
        Duration.of_seconds(20)
    ).with_timestamp_assigner(TradeDataTimestampAssigner())

    data_source = env.add_source(consumer).assign_timestamps_and_watermarks(
        watermark_strategy
    )

    buy_sell_kafka_producer = FlinkKafkaProducer(
        topic="buy_sell_advice",
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=BUYSELL_EVENT_SCHEMA
        ),
        producer_config=kafka_properties,
    )

    ema_kafka_producer = FlinkKafkaProducer(
        topic="ema_results",
        serialization_schema=AvroRowSerializationSchema(
            avro_schema_string=EMA_RESULT_EVENT_SCHEMA
        ),
        producer_config=kafka_properties,
    )

    windowed_stream = (
        data_source.key_by(lambda x: x["symbol"])
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
    # windowed_stream.print()

    windowed_stream.add_sink(ema_kafka_producer)

    buy_sell_events_stream = windowed_stream.flat_map(
        FilterAndMapToBuySellEventFunction(),
        output_type=Types.ROW_NAMED(
            [
                "symbol",
                "buy_or_sell_action",
                "window_end",
            ],
            [
                Types.STRING(),
                Types.STRING(),
                Types.LONG(),
            ],
        ),
    )

    # Produce mapped data to Kafka
    buy_sell_events_stream.add_sink(buy_sell_kafka_producer)

    env.execute()
