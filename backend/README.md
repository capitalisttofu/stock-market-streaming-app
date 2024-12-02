# NodeJS Backend

We have two different Node.js processes running in our backend. One is a webserver that allows users using the frontend
to subsribe to the data of the three relevant Kafka topics `trade_data`, `ema_results` and `buy_sell_advice`.
The other process parses the CSV files and produces events to the `sorted_raw_trade_data` topic. Before running the csv parser,
add the trade data files to the `backend/rawData` directory

Our Kafka topic and partition initialization code is also included in this repository.

## Installation

- node version 20.x+
- npm 10.x+

Run `npm install`

### Provisioning Kafka

The provisioning ts script can be found in `src/provisionKafka.ts`. It recreatis the application specific topics each time, so data will be lost
when re-provisioning, except for the `sorted_raw_trade_data` topic as we except it to remain stable when testing and developing.
If you want to recreate it, set `RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION` to true in the `.env` file and rerun the provision script.

To provision the Kafka instance, make sure you are running the cluster according to the instructions in the root of this repository (using the docker-compose file)
and then inside this backend folder run `npm run provision:kafka`

### Avro Definitions

The Avro definitions can be found in the `src/lib/avro.ts` file.

# Running the Application

## Injecting CSV Data to the Raw Data Trade Stream

Running the script can be done with `npm run csv-to-raw-trade-stream`
If when developing you need to clear the stream due to broken data
please follow the provisioning instructions above (and setting correct .env value)

## Testing Output of the buy_sell_advice Topic (and Other Topics)

We have a simple test script to log every 1000th buy or sell advice event
that the pyflink app produces. It can be run with `npm run test-buy-sell-consumer`.

Scripts to consume other topics can also be found in the `package.json`

## Trade Data API

The trade data API can be run with `npm run trade-data-api`.


# Process Descriptions

## Injecting CSV Data to the Raw Data Trade Stream

`csv-to-raw-trade-stream` searches for CSV files in the `backend/rawData` directory. Non CSV files are ignored.
Each file is processed one by one in ascending order. The parser ignores lines in the csv file, which start with
the `#` character as they are assumed to be comments. The parser assumes that the first uncommented line contains the header
of the data. After processing the header, each row of the file is parsed by extracing the following values:

- `ID` is an unique identifier of a symbol with trading exchange: Paris (FR) / Amsterdam (NL) / Frankfurt (ETR)
- `SecType` is the security type: \[E]quity or \[i]ndex
- `Last` is the last trade price. This attribute is optional
- `Trading time` is the time of last update (bid / ask / trade) in HH-MM-SS.sss or HH-MM-SS.ssss. This attribute is optional
- `Trading date` is the date of last trade in DD-MM-YYYY. This attribute is optional

The processing is controlled with the `NOW_DATE` environmental variable in the `.env` file, which is to be given in
the `ISO 8601` standard. If the timestamp is incorrectly formatted, the timestamp `2021-08-11T13:00:01Z` is used as default.
The timestamp represents the data, which is to be considered the current date. Before the `NOW_DATE`,
the events are directly are processed directly after each other. If the timestamp of the event is larger than `NOW_DATE`,
the injector waits the time difference between the previous and current event before sending the current event.

The preprocessing step involves mapping the timestamps of the events to a more appropriate time format to process the
events in PyFlink using the current time rather than relying on watermarks. The new timestamp is calculated as follows:
`datapoint_new_timestamp` = `script_start_timestamp` (`NOW_DATE` - `datapoint_timestamp`)
where `script_start_timestamp` is the time whenever the `csv-to-raw-trade-stream` process began.

If you want to run all data in the csv as fast as possible updating the timestamps to real time running, set
`SKIP_DATE_MODIFICATION` to true in the `.env` file

After preprocessing, the data is converted into a `RawTradeEvent` Avro. Finally, `csv-to-raw-trade-stream`
produces new messages in the `sorted_raw_trade_data` topic with the financial data.

## Trade Data API

The trade data API consumes three Kafka topics: `trade_data`, `ema_results`, and `buy_sell_advice`, and sends the events with WebSockets
to the frontend. It consists of an express API, which listens on port `3000`. The API uses Socket.io for managing the WebSockets.
Socket.io rooms are used for events subscriptions from `trade_data`, and `ema_results` topics. The rooms are based on the symbols; therefore,
the user subsribes to all events from a symbol. Events from the `buy_sell_advice` topic are always sent to the frontend.

The trade data API sends messages with websockets with the following event names:
- `buy-sell-advice-message` send `BUY` and `SELL` advices from `buy_sell_advice` topic
- `trade-event-message` sends the trade events from `trade_data` topic
- `ema-result-event-message` to send events from the `ema_results` topic
- `new-symbol` alerts the frontend that a new symbol is observed. The backend keeps track of previous symbols with a set
- `all-symbols` is used to send all symbols whenever the frontend connects to the API for the first time

The trade data API receives messages with websockets with the following event names:
- `subscribe` to subscribe to new price and EMA events
- `unsubscribe` to unsubscribe from new price and EMA events
