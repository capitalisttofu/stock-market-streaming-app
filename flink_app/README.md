# PyFlink Trade App

## Running example.py

Setup the docker cluster as explained in the root README.md

Then in the root, run `docker exec -it stock-market-jobmanager  flink run -py /flink_app/example.py`

The example.py currently logs the data to the standard out of the task manager which can be accessed
with docker, for example `docker logs -f stock-market-taskmanager`
However, if you want to get the produced output into your host machine, you can run it with

`docker exec -it stock-market-jobmanager  flink run -py /flink_app/example.py --output=/taskmanager_output_logs`

The results should be available in the `taskmanager_output_logs` directory