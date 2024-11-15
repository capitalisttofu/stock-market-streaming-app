import * as express from 'express'
import { consumeTradeEvents } from './adviceAndTradeDataConsumer'

const PORT = 3000

const app = express()

const main = async () => {
  await consumeTradeEvents()
}
void main()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () =>
  console.log(`Trade data API listening on port ${PORT}`),
)
