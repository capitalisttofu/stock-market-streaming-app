# Stock Market Streaming App

## Introduction

This repository contains course project code as a solution for the
https://2022.debs.org/call-for-grand-challenge-solutions/

The specifics and requirements of the course project can be found in the pdf
`CS_E4780_Course_Project.pdf` in the root of this repository.

## Important Components

### Kafka Cluster

We use Kafka as our message stream. There are six relevant Kafka topics:

- `sorted_raw_trade_data`
- `trade_data`
- `buy_sell_advice`
- `discarded_data`
- `ema_results`
- `late_trade_data`

`sorted_raw_trade_data` topic has all trade data sorted in (mostly) the correct order based off Trading Date and Trading Time.
This is a simplification to how the actual data would be recieved in this type of application due to the fact
that events can come out of order and so forth. As per the original competition, the data is not stored in csv format but stored in the stream
in Avro format for space efficiency and serialization/deserialization efficiency. Protobuffer was not used as there were challenges involved in the
serialisation and deserialisation in PyFlink.
Only the relevant fields from the given data csv's is injected into this topic. We consider this kafka topic to be outside of our application and handle it
as a "mocked data source". The relevant code to fill this topic is found in this repository. The raw csv data used to populate the `sorted_raw_trade_data` topic can be found at https://zenodo.org/records/6382482.

`trade_data` topic consists of all the trade data that is read from `sorted_raw_trade_data` except with the addition of a new field `symbol` that is parsed from the `ID` field.

`buy_sell_advice` topic consists of `Buy` or `Sell` advice as described in the challenge and Course Project pdf. The Apache Flink application produces messages to this topic based off the calculations being run in the Apache Flink application.

`discarded_data` contains data points, which have been discarded due to not having values for the required attributes. The data points are discarded in `raw_trade_event_parser`. Currently, the discarded data points are consumed by a test discarded consumer located in the backend. Within this consumer, it is possible to add the functinality of storing the data elsewhere for further processing if required.

`ema_results` contains the EMA (exponential moving average) calculation events produced in the end of each tumbling window per symbol, if the tumbling window
contains any trade events.

`late_trade_data` contains the trade events, which were late to the tumbling window.

## Setup

We use docker to run the Kafka Cluster as well as the Apache Flink application. 

First one must build our Flink image that supports PyFlink (found in the `pyflink_image` directory).
This can be done with
`docker build -t my-pyflink-image:latest ./pyflink_image`

Then one can simplfy spin up Kafka and the Flink nodes with `docker-compose up`.
IMPORTANT NOTE: We have set high memory limit for the job, it is recommended to have at least 16gb of memory
available to docker

Instructions on provisioning the partition and topics of the Kafka cluster can be found in the `backend/README.md` file.
The same file also contains the instructions on running the Node.js processes.

Instructions on running PyFlink jobs can be found in the `flink_app/README.md` file.
The Flink dashboard is available at `http://localhost:8081/#/overview`

The frontend is responsible for the data visualizations. Instructions on running the frontend can be found in the `frontend/README.md` file.


### Running Instructions TLDR

1. Build the Flink image with `docker build -t my-pyflink-image:latest ./pyflink_image`
2. Spin up Kafka and the Flink nodes with `docker-compose up`
3. Install dependencies in the `backend` directory with `npm install`
4. Provision Kafka in `backend` directory with `npm run provision:kafka`
5. Make shared volume container accessible by the Flink user by running `docker exec -it stock-market-taskmanager chown -R 9999:9999 /flink-checkpoints`
6. Run Flink app with `docker exec -it stock-market-jobmanager  flink run -py /flink_app/app.py --pyFiles /flink_app`
7. Run the trade data API in the `backend` directory with `npm run trade-data-api`
8. If a user wants to log events, run the chosen loggers in the `backend` directory. For example, `npm run test-buy-sell-consumer` runs the buy and sell event logger
9. Install dependencies in the `frontend` directory with `npm install`
10. Run frontend with `npm run dev` in the `frontend` directory
10. Run the CSV parser in the `backend` directory with `npm run csv-to-raw-trade-stream`
