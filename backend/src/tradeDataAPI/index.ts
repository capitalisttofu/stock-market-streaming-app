import { TRADE_DATA_TOPIC, BUY_SELL_ADVICE_TOPIC } from '../constants'
import { consumeMessages } from './kafkaConsumer'
import { initializeSocket } from './socket'
import * as express from 'express'
import { createServer } from 'node:http'

const TRADE_DATA_CONSUMER_ID = 'trade_data'
const BUY_SELL_ADVICE_CONSUMER_ID = 'buy_sell_advice'
const PORT = 3000

const app = express()
const server = createServer(app)

const main = async () => {
  await consumeMessages(TRADE_DATA_CONSUMER_ID, TRADE_DATA_TOPIC)
  await consumeMessages(BUY_SELL_ADVICE_CONSUMER_ID, BUY_SELL_ADVICE_TOPIC)
}

void main()

initializeSocket(server)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})


server.listen(PORT, () =>
  console.log('Trade data API listening on port 3000'),
)
