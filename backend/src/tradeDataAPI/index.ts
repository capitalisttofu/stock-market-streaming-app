import * as express from 'express'
import * as http from 'http'
import { consumeTradeEvents } from './adviceAndTradeDataConsumer'
import { initializeSocket } from './socket'

const PORT = 3000

const app = express()
const server = http.createServer(app)

initializeSocket(server)

const main = async () => {
  await consumeTradeEvents()
}
void main()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

server.listen(PORT, () =>
  console.log(`Trade data API listening on port ${PORT}`),
)
