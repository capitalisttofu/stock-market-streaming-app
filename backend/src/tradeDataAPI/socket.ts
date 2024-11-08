import { DefaultEventsMap, Server, Socket } from 'socket.io'
import { Server as HttpServer } from "http"
import { TradeEvent } from '../../generatedProto/compiled'

let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server)

  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id)

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })
}

export const broadcastTradeEvent = (topic: string, message: TradeEvent) => {
  if (io) {
    io.emit("trade-event-message", { topic, message })
  }
}
