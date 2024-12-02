In this directory you can find our performance testing logs.

They were run using a Apple M1 Pro (32GB).

Pyflink was configured to be allowed to use 12 GB of memory.

The files are named after the events they are observing as well as the start time of the logging application.
Each logging application was run in parallel and they can be found in the `backend` directory.

The data was first run into the raw_trade_data before running the performance test using our `csvToStream` app in the `backend` directory. The data was processed using the actual event time, and thus the processing can happen
quicker than in real time where you would need to wait for new events.

The dataset used was

- debs2022-gc-trading-day-08-11-21.csv
- debs2022-gc-trading-day-09-11-21.csv
- debs2022-gc-trading-day-10-11-21.csv
- debs2022-gc-trading-day-11-11-21.csv
- debs2022-gc-trading-day-12-11-21.csv

The `test_buy_sell_consumer` log consumed the `buy_sell_advice` kafka topic. It includes both performance
logs as well as the `BUY` and `SELL` advice per symbol based off the EMA logic described in the problem description.

The `test_discard_consumer` log consumed the `discarded_data` topic, where our pyflink produces the RawTradeEvents
parsed from the CSV that either are missing the latest trade date, latest trade time, or latest trade price.

The `test_ema_consumer` log consumes the `ema_results` which are the EMA calculations per symbol per 5 minute tumbling window
that our pyflink calculates, which are the basis for the BUY and SELL advice.

The `test_late_trade_data_consumer` log consumes the `late_trade_data` topic. Pyflink adds late events into this
topic. As can be seen, with using the watermark stragey `for_bounded_out_of_orderness` with a duration of 20 seconds,
there are no late events. This is because the valid datapoints in the given datasets are almost perfectly in order
and pyflink manages to process them correctly.

The `test_trade_data_consumer` log consumes the valid Trade Events that have the latest trade time, latest trade date
and latest trade price.

In the performance test logger, we use a 10 second interval to aggregate results and output them into the log.

An example row: `2024-12-02T00:56:08.880Z  TotalEvents: 4739580  WindowEvents: 9753  WindowEventsPerSec 975.30  WindowAvgDelayMs: 23.87  WindowMinDelayMs: 2.00  WindowMaxDelayMs: 64.00  LatestEventTime: 2021-11-12T16:39:24.199Z  WindowLatestEventTime: 2021-11-12T16:39:24.199Z`
The first value is the system timestamp when the log row was added. TotalEvents are the total amount of events
observerd during the run. WindowEvents is the amount of events observed in the 10 second (system time) window.
The windowDelay calculations are case specific. They are further described below. The LatestEventTime is the latest
timestamp (event time) of all data observed during the run. The WindowLatestEventTime is the latest timestmap observed
in the 10 second window.

For the delays, we support them for `test_buy_sell_consumer`, `test_ema_consumer` and `test_trade_data_consumer`.
They are calculated by injecting a system timestamp in the flink process to the events, and taking the difference
to the system time when the event was consumed.
For `test_trade_data_consumer`, this happens in our Process function in the pyflink job that decides to either
keep the RawTradeEvent (and mapping it into a TradeEvent) or discarding it into the `discarded_data` topic.
For `test_ema_consumer`, the timestamp is injected in the ProcessFunction that is run once the TumblingWindow
completes and the ema value is calculated from the latest trade event for that symbol in the window.
For `test_buy_sell_consumer` we use the value we injected into the EMAResultEvent described previously.

We also provide some screenshots of the performance during the run form the Flink Web UI dashboard.

In `with_paralellism_3` logs, we used 3 partitions per kafka topic with the flink job using parallism 3.
There was/is a bug in our test consumer that it might timeout and stop working after some time, and thus
there are 2 files for the `test_buy_sell_consumer` and 3 files for the `test_late_trade_data_consumer`.
Note, because of this, the totalEvents for `test_buy_sell_consumer` need to be summed from the two logs.
There is a small chance some data is missing due to us not having time to look into the timeout issue
of the kafka consumer, but most likely no data was missing. HOWEVER, in the start of the second log some buy
sell events are out of order, most likely due to racing to consume all of them from all 3 partitions
that had been stuck there due to the `test_buy_sell_consumer` disconnecting.

