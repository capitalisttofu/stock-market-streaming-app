import * as express from 'express'
import * as http from 'http'
import {
  buySellEvents,
  consumeTradeEvents,
  emajEventsBySymbol,
  tradeEventsBySymbol,
} from './adviceAndTradeDataConsumer'
import { initializeSocket } from './socket'
import * as cors from 'cors'

const PORT = 3000

const app = express()

// Allow all origins as this is a test setup
app.use(cors())

const server = http.createServer(app)

initializeSocket(server)

const main = async () => {
  await consumeTradeEvents()
}
void main()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/trade_events/:symbol', (req, res) => {
  const symbol = req.params.symbol

  const tradeEvents = tradeEventsBySymbol[symbol] ?? []

  res.send(tradeEvents)
})

app.get('/ema_events/:symbol', (req, res) => {
  const symbol = req.params.symbol

  const emajEvents = emajEventsBySymbol[symbol] ?? []

  res.send(emajEvents)
})

app.get('/buysell_events', (req, res) => {
  res.send(buySellEvents)
})

server.listen(PORT, () =>
  console.log(`Trade data API listening on port ${PORT}`),
)
