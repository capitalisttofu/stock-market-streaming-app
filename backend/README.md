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

### Generating Proto definitions

We share our proto definitions within our nodejs code and the pyflink app.
The proto definitions can be found in the root of this repository in the `proto/messages.proto` file.
To use these defintions in an easy way in typescript, we compile them to a js and .d.ts file found in
`backend/generatedProto` directory. The script to do this can be found in the package.json
`npm run gen-proto-ts-files`. We have committed the compiled proto def files to git for easier setup,
but if there are changes done to the raw proto files found in the `proto` directory, then the compile script must be
re-ran and the new definitions committed to git.

# Running the application

## Injecting csv data to raw data trade stream

`csv-to-raw-trade-stream` searches for CSV files in the `backend/rawData` directory. Non CSV files are ignored.
Each file is processed one by one in ascending order. The parser ignores lines in the csv file, which start with
the `#` character as they are assumed to be comments. The parser assumes that the first uncommented line contains the header
of the data. After processing the header, each row of the file is parsed by extracing the following values:
- `ID` is an unique identifier of a symbol with trading exchange: Paris (FR) / Amsterdam (NL) / Frankfurt (ETR)
- `SecType` is the security type: \[E]quity or \[i]ndex
- `Last` is the last trade price
- `Trading time` is the time of last update (bid / ask / trade) in HH-MM-SS.sss
- `Trading date` is the date of last trade in DD-MM-YYYY.

After preprocessing, the data is converted into a `RawTradeEvent` protobuf. Finally, `csv-to-raw-trade-stream`
produces new messages in the `sorted_raw_trade_data` topic with the financial data. The sending time of the message
depends on the `Trading time`. Before 7 am, there are typically fewer events.
Therefore, the events are directly sent to the `sorted_raw_trade_data` topic. After 7 am, the number of events
increases, and `csv-to-raw-trade-stream` simulates a real event producer by waiting the `Trading time` difference of
current and next event before sending the next event. If the `Trading time` of the datapoint is missing,
the event is sent directly.

Running the script can be done with `npm run csv-to-raw-trade-stream`
If when developing you need to clear the stream due to broken data
please follow the provisioning instructions above (and setting correct .env value)

## Parsing Raw Trade Events

TODO: More instructions here later

To run our `sorted_raw_trade_data` consumer that parses the messages run the script
`npm run raw-trade-event-parser`. The program does not autoshutdown but remains listening to events.
If you want to rerun ALL data available in the `sorted_raw_trade_data` (and not just latest data that has not yet been parsed) please run the script
`npm run reset-kafka-raw-trade-event-parser-offset`. **NOTE** force closing the `raw-trade-event-parser`
leaves the consumer running for a while due to not disconnecting it, so you might need to wait
a minute or two before you can run the script.
The parser can be run after, before, or during running the `csv-to-raw-trade-stream`

After consuming the messages, `raw_trade_event_parser` produces new messages to the `trade_data` topic.
The messages are sent to different partitions based on the symbol of the trade data.
