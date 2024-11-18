import { DefaultEventsMap, Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'

type EventName =
  | 'buy-sell-advice-message'
  | 'trade-event-message'
  | 'ema-result-event'

// Map: symbol -> array of subsribed users
//const symbolSubscriptions = new Map<string, string[]>()

let io:
  | Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  | undefined = undefined

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id)

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}

export const broadcastEvent = (eventName: EventName, message: any) => {
  if (io) {
    io.emit(eventName, { message })
  }
}
