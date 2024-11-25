# NodeJS backend

We have two different nodejs processes running in our backend.
One is a webserver that allows users using the frontend to subsribe
to the data of the two relevant kafka topics `trade_data` and `buy_sell_advice`.

The other process is a NodeJS based consumer of the `sorted_raw_trade_data` topic
and producer to the `trade_data` topic.

Our Kafka topic and partition initialization code is also included in this repository.

## Installation

- node version 20.x+
- npm 10.x+

Run `npm install`

### Provisioning Kafka

The provisioning ts script can be found in `src/provisionKafka.ts`. It recreatis the application specific topics each time, so data will be lost
when re-provisioning, except for the `sorted_raw_trade_data` topic as we except it to remain stable when testing and developing.
If you want to recreate it, set `RECREATE_RAW_TRADE_DATA_TOPIC_ON_PROVISION` to true in the `.env` file and rerun the provision script.

To provision the kafka instance, make sure you are running the cluster according to the instructions in the root of this repository (using the docker-compose file)
and then inside this backend folder run `npm run provision:kafka`

### Avro definitions

The Avro definitions can be found in the `src/lib/avro.ts` file.

# Running the application

## Injecting csv data to raw data trade stream

`csv-to-raw-trade-stream` searches for CSV files in the `backend/rawData` directory. Non CSV files are ignored.
Each file is processed one by one in ascending order. The parser ignores lines in the csv file, which start with
the `#` character as they are assumed to be comments. The parser assumes that the first uncommented line contains the header
of the data. After processing the header, each row of the file is parsed by extracing the following values:

- `ID` is an unique identifier of a symbol with trading exchange: Paris (FR) / Amsterdam (NL) / Frankfurt (ETR)
- `SecType` is the security type: \[E]quity or \[i]ndex
- `Last` is the last trade price. This attribute is optional
- `Trading time` is the time of last update (bid / ask / trade) in HH-MM-SS.sss or HH-MM-SS.ssss. This attribute is optional
- `Trading date` is the date of last trade in DD-MM-YYYY. This attribute is optional

After preprocessing, the data is converted into a `RawTradeEvent` Avro. Finally, `csv-to-raw-trade-stream`
produces new messages in the `sorted_raw_trade_data` topic with the financial data.

Running the script can be done with `npm run csv-to-raw-trade-stream`
If when developing you need to clear the stream due to broken data
please follow the provisioning instructions above (and setting correct .env value)

## Testing output of buy_sell_advice topic (and other topics)

We have a simple test script to log every 1000th buy or sell advice event
that the pyflink app produces. It can be run with `npm run test-buy-sell-consumer`.

Scripts to consume other topics can also be found in the `package.json`

## Trade Data API

The trade data api consumes two Kafka topics: `trade_data` and `buy_sell_advice`, and sends the events with WebSockets
to the frontend. It consists of an express API, which listens on port 3000. The API uses Socket.io for managing the
WebSockets.
The trade data API can be run with `npm run trade-data-api`.
