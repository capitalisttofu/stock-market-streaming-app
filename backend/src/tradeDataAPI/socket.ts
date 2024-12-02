import { Server as HttpServer } from 'http'
import { DefaultEventsMap, Server, Socket } from 'socket.io'
import { symbols } from './adviceAndTradeDataConsumer'

type EventName =
  | 'buy-sell-advice-message'
  | 'trade-event-message'
  | 'ema-result-event-message'

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
    socket.emit('all-symbols', [...symbols])

    socket.on('subscribe', (symbol) => {
      socket.join(symbol)
      console.log(`User ${socket.id} subscribed to ${symbol}`)
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

export const broadcastNewSymbolToSubscribers = (messageSymbol: string) => {
  if (io) {
    io.emit('new-symbol', messageSymbol)
  }
}

export const broadcastEventToSubscribers = (
  eventName: EventName,
  messageSymbol: string,
  message: any,
) => {
  if (io) {
    // Broadcast event to users, which have subscribed to the symbol
    io.to(messageSymbol).emit(eventName, message)
  }
}

export const broadcastEventToAll = (eventName: EventName, message: any) => {
  io?.emit(eventName, message) // Broadcast event to all users
}
