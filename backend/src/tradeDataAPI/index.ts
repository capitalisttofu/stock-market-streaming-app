import { TRADE_DATA_TOPIC, BUY_SELL_ADVICE_TOPIC } from '../constants'
import * as express from 'express'
import { consumeMessages } from './kafkaConsumer'

const TRADE_DATA_CONSUMER_ID = 'trade_data'
const BUY_SELL_ADVICE_CONSUMER_ID = 'buy_sell_advice'
const PORT = 3000

const app = express()

const main = async () => {
  await consumeMessages(TRADE_DATA_CONSUMER_ID, TRADE_DATA_TOPIC)
  await consumeMessages(BUY_SELL_ADVICE_CONSUMER_ID, BUY_SELL_ADVICE_TOPIC)
}

void main()


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () =>
  console.log('Trade data API listening on port 3000'),
)
