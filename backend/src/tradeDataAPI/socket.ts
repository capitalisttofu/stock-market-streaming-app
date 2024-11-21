import { DefaultEventsMap, Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'

type EventName =
  | 'buy-sell-advice-message'
  | 'trade-event-message'
  | 'ema-result-event'

const symbols = new Set()
const subscribeAllRoom = 'all' // No conflicts as symbols are upper-case characters

let io:
  | Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  | undefined = undefined

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  io.on('connection', (socket: Socket) => {
    console.log('New user connected:', socket.id)

    // Send all symbols to a new user
    socket.emit('all-symbols', JSON.stringify([...symbols]))

    socket.on('subscribe', (symbol) => {
      socket.join(symbol)
      console.log(`User ${socket.id} subscribed to ${symbol}`)
    })

    socket.on('subscribe-all', () => {
      socket.join(subscribeAllRoom)
      console.log(`User ${socket.id} subscribed to all events`)
    })

    socket.on('unsubscribe-all', () => {
      socket.leave(subscribeAllRoom)
      console.log(`User ${socket.id} unsubscribed from all events`)
    })

    socket.on('unsubscribe', (symbol) => {
      socket.leave(symbol)
      console.log(`User ${socket.id} unsubscribed from ${symbol}`)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}

export const broadcastEvent = (
  eventName: EventName,
  messageSymbol: string,
  message: any,
) => {
  if (io) {
    if (!symbols.has(messageSymbol)) {
      // Broadcast to clients that a new symbol has appeared
      io.emit('new-symbol', messageSymbol)
      symbols.add(messageSymbol)
    }

    // Broadcast event to users, which have subscribed to the symbol
    io.to(subscribeAllRoom).to(messageSymbol).emit(eventName, message)
  }
}
