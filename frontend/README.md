# React Frontend

React frontend is setup with Vite. Socket.IO is used to fetch events from the backend trade data API.
Install dependencies with `npm install`. Start the frontend with `npm run dev`. The frontend starts on port `5000`.

The frontend consists of a graph, which can be used to visualize price, EMA38, and EMA100 values, and
includes two tables. In the first table, the user can choose the visualized event. The table can also be used to subscribe
to `BUY` and `SELL` events from stocks. New stocks are added to the table whenever a WebSocket message with the event name
`new-symbol` or `all-symbols` is received. The frontend receives events that a new symbol has been observed via
websockets, and appends them to the table. The second tables stores all previous `BUY` and `SELL` events.


## Visualize Events

The user can subscribe to a single symbol to visualize the price, EMA38, and EMA100 values of the symbol. 
Once a user chooses to visualize the event, the latest events from the symbol are fetched from the database,
and shown to the user. The frontend sends a WebSocket subscription message to the backend to receive live event
updates for the specified symbol.


## BUY and SELL Events

The frontend is sent all `BUY` and `SELL` events. The frontend filters and shows them to the user based on the
preference of the user. The user can subscribe to all events or choose a subset of the events.
If the user has not subscribed to the symbol, the alert is not shown.
The alert is displayed using a toast notification, and the event type (`BUY` or `SELL`) is shown in the table.


## Websocket Connections

The frontend interracts with the backend with websockets. The frontend waits for messages from the following event names:
- `buy-sell-advice-message` receives `BUY` and `SELL` advices. The websockets send `S` or `B` depending on which advice is to be shown
- `trade-event-message` receives prices of a symbol
- `ema-result-event-message` receives EMA38 and EMA100 values of a symbol
- `new-symbol` receives events of a new symbol
- `all-symbols` receives events of multiple new symbols. Such an event is typically received in the beginning whenever the user
connects to the backend to send all symbols to the frontend

The frontend sends messages with the following event names:
- `subscribe` to subscribe to new price and EMA events. The message consists of the symbol
- `unsubscribe` to unsubscribe from new price and EMA events. The message consists of the symbol
