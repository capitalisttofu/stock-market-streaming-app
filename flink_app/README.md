# PyFlink Trade App

## Running app.py

Setup the docker cluster as explained in the root README.md

Make sure you have provisioned kafka as explained in the `backend` README.md.

Then in the root, run `docker exec -it stock-market-jobmanager  flink run -py /flink_app/app.py`

The app.py currently logs the data to the standard out of the task manager which can be accessed
with docker, for example `docker logs -f stock-market-taskmanager`

Jobs can be canelled using the web-api at `http://localhost:8081/#/overview`

To rerun the flinkjob from the start of the `trade_data` topic, you can run the script found in the `backend` directory
`npm run reset-kafka-flink-app-offset`

To run the jobs in parallel, specify it with the -p flag.
Example (two jobs running parallel)
`docker exec -it stock-market-jobmanager  flink run -p 2 -py /flink_app/app.py`