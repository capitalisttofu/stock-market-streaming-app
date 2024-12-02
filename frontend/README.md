# React Frontend

React frontend is setup with Vite. Socket.IO is used to fetch events from the backend trade data API.

The frontend consists of a graph, which can be used to visualize price, EMA38, and EMA100 values, and
includes two tables. In the first table, the user can choose the visualized event. The table can also be used to subscribe
to `Buy` and `Sell` events from stocks. New stocks are added to the table whenever a WebSocket message with the event name
`new-symbol` or `all-symbols` is received. The frontend receives events that a new symbol has been observed via
WebSockets, and appends them to the table. The second tables stores all previous `Buy` and `Sell` events.

## Installation

- npm 10.x+

Install dependencies with `npm install`.

## Running the Application

Run the frontend with `npm run dev`. The frontend starts on port `5000`.

## Event Visualizations

The user can subscribe to a single symbol to visualize the price, EMA38, and EMA100 values of the symbol. 
The frontend sends a WebSocket subscription message to the backend to receive live event updates for the subscribed symbol.


## Buy and Sell Events

The frontend is sent all `Buy` and `Sell` events. The frontend filters and shows them to the user based on the
preference of the user. The user can subscribe to all events or choose a subset of the events.
If the user has not subscribed to the symbol, the alert is not shown.
The alert is displayed using a toast notification, and the event type (`Buy` or `Sell`) is shown in the table.


## Websocket Connections

The frontend interracts with the backend with WebSockets. The frontend waits for messages from the following event names:
- `buy-sell-advice-message` receives `Buy` and `Sell` advices
- `trade-event-message` receives prices of a symbol
- `ema-result-event-message` receives EMA38 and EMA100 values of a symbol
- `new-symbol` receives events of a new symbol
- `all-symbols` receives events of multiple new symbols. Such an event is typically received in the beginning whenever the user
connects to the backend to send all symbols to the frontend

The frontend sends messages with the following event names:
- `subscribe` to subscribe to new price and EMA events. The message consists of the symbol
- `unsubscribe` to unsubscribe from new price and EMA events. The message consists of the symbol
