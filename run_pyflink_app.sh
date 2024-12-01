#!/bin/bash
# Ensures that correct permissions for shared volume (our images have flink user as 9999)
docker exec -it stock-market-taskmanager chown -R 9999:9999 /flink-checkpoints

#Runs the app with parallelism 2 by default
docker exec -it stock-market-jobmanager flink run -p 3 -py /flink_app/app.py --pyFiles /flink_app