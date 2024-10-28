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
