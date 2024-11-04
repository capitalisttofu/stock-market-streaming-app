# Stock Market Streaming App

## Introduction

This repository contains course project code as a solution for the
https://2022.debs.org/call-for-grand-challenge-solutions/

The specifics and requirements of the course project can be found in the pdf
`CS_E4780_Course_Project.pdf` in the root of this repository.

## Important Components

### Kafka Cluster

We use Kafka as our message stream.
There are four relevant Kafka topics

- `sorted_raw_trade_data`
- `trade_data`
- `buy_sell_advice`
- `discarded_data`

`sorted_raw_trade_data` topic has all trade data sorted in the correct order based off Trading Date and Trading Time.
This is a simplification to how the actual data would be recieved in this type of application due to the fact
that events can come out of order and so forth.As per the original competition, the data is stored in the stream
in grpc/protobuffer format for space efficiency and serialization/deserialization efficiency. Only the relevant fields
from the given data csv's is injected into this topic. We consider this kafka topic to be outside of our application and handle it
as a "mocked data source". The relevant code to fill this topic is found in this repository. The raw csv data used to populate the `sorted_raw_trade_data` topic can be found at https://zenodo.org/records/6382482.

`trade_data` topic consists of all the trade data that is read from `sorted_raw_trade_data` except with the addition
of a new field `symbol` that is parsed from the `ID` field. The data is paritioned into the `trade_data` topic using this symbol
to guarantee that all data for a specific symbol is found in a specific kafka parition. This is a useful property to improve
the performance of our Apache Flink application.

`buy_sell_advice` topic consists of `Buy` or `Sell` advice as described in the challenge and Course Project pdf. The Apache Flink application produces messages to this topic based off the calculations being run in the Apache Flink application.

`discarded_data` contains data points, which have been discarded due to not having values for the required attributes. The data points are discarded in `raw_trade_event_parser`. Currently, the discarded data points are not consumed. However, a consumer could easily be created if the missing data needs to be analyzed.

## Setup

We use docker to run the kafka cluster as well as the apache flink application. They can be simplfy spun up with `docker-compose up`. Instructions on provisioning the partition and topics of the kafka cluster can be found in the `backend/README.md` file.



