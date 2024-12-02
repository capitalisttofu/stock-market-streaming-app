#!/bin/bash
# Ensures that correct permissions for shared volume (our images have flink user as 9999)
docker exec -it stock-market-taskmanager chown -R 9999:9999 /flink-checkpoints

docker exec -it stock-market-jobmanager flink run -py /flink_app/app.py --pyFiles /flink_app