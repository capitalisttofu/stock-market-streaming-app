#!/bin/bash

# Hackish script to run the raw-trade-event-parser
# Until memory issues can be fixed
SCRIPT_NAME="raw-trade-event-parser"

while true; do
    # Run the npm script
    npm run "$SCRIPT_NAME"

    # Check exit status
    if [ $? -ne 0 ]; then
        echo "Script $SCRIPT_NAME crashed with exit code $?. Restarting..."
        sleep 2  # Optional: add delay before restart
    else
        echo "Script $SCRIPT_NAME completed successfully."
        break  # Exit loop if the script completes without errors
    fi
done