# PyFlink Trade App

Our PyFlink application reads data from the `sorted_raw_trade_data` and uses Event Time that is calculated using the
`tradingtime` and `tradingdate` fields. The data is then processed to check if all the needed fields are available
for our application. If they are, the data is transformed into a TradeEvent (where the symbol and exchange are parsed from the id),
otherwise the datapoint is discarded into the `discarded_data` topic using a sideoutput. These TradeEvents are produced into the
`trade_data` topic.

The data is then processed using a key_by function based off the symbol and then processed using Tumbling Windows of 5 minutes to calculate EMA (exponential moving average) results (as explained in the `CS_E4780_Course_Project.pdf`). The previous values used in the EMA caculation are stored
in the key'd state as they are used to calculate the new values. If there are no trade events in the 5 minute window, then no processing happens.

The EMA results are then produced into the topic `ema_results` and the results stream is also further processed in a FlatMapFunction
to check if a buy or sell event should be emitted based of the current and previous EMA values. If a buy or sell event should be emitted
they are produced into the `buy_sell_advice` topic.


## Running app.py

Setup the Docker cluster as explained in the root README.md

Make sure you have provisioned Kafka as explained in the `backend` README.md.

Also, you must make sure that the shared volume in the container is accessible by the Flink user, which has a uid 9999.
This is a one time operation that can be done with 
`docker exec -it stock-market-taskmanager chown -R 9999:9999 /flink-checkpoints`


Then in the root dir, run `docker exec -it stock-market-jobmanager  flink run -py /flink_app/app.py --pyFiles /flink_app`

The app.py currently logs the data to the standard out of the task manager which can be accessed
with Docker, for example `docker logs -f stock-market-taskmanager`

Jobs can be cancelled using the web-api at `http://localhost:8081/#/overview`

To rerun the FlinkJob from the start of the `sorted_raw_trade_data` topic, you can run the script found in the `backend` directory
`npm run reset-kafka-flink-app-offset`


Example (two jobs running parallel)
`docker exec -it stock-market-jobmanager  flink run -py /flink_app/app.py --pyFiles /flink_app`