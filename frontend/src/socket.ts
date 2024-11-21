import { io, Socket } from 'socket.io-client'
import {
  ALL_SYMBOLS_MESSAGE_NAME,
  BACKEND_URI,
  NEW_SYMBOL_MESSAGE_NAME,
  SUBSCRIBE_ALL_MESSAGE_NAME,
  SUBSCRIBE_MESSAGE_NAME,
  TRADE_EVENT_MESSAGE_NAME,
  UNSUBSCRIBE_ALL_MESSAGE_NAME,
  UNSUBSCRIBE_MESSAGE_NAME,
} from './constants'
import { TradeEvent } from './types'

let socket: Socket | undefined = undefined

export const initializeSocket = (
  setStocks: (stockStrings: string[]) => void,
  setTradeEvents: React.Dispatch<React.SetStateAction<TradeEvent[]>>,
) => {
  socket = io(BACKEND_URI)

  socket.on(ALL_SYMBOLS_MESSAGE_NAME, (stockStrings: string) => {
    setStocks(JSON.parse(stockStrings))
  })

  socket.on(NEW_SYMBOL_MESSAGE_NAME, (stockString: string) => {
    setStocks([stockString])
  })

  socket.on(TRADE_EVENT_MESSAGE_NAME, (event: TradeEvent) => {
    setTradeEvents((prevMessages) => [...prevMessages, event])
  })

  return () => {
    socket?.disconnect()
  }
}

/**
 * @param symbol symbol. If undefined, subscribes to all stocks
 */
export const handleSubscribe = (symbol?: string) => {
  if (!socket) return

  if (symbol) {
    socket.emit(SUBSCRIBE_MESSAGE_NAME, symbol)
  } else {
    socket.emit(SUBSCRIBE_ALL_MESSAGE_NAME)
  }
}

/**
 * @param symbol symbol. If undefined, unsubsribes from all stocks
 */
export const handleUnsubscribe = (symbol?: string) => {
  if (!socket) return

  if (symbol) {
    socket.emit(UNSUBSCRIBE_MESSAGE_NAME, symbol)
  } else {
    socket.emit(UNSUBSCRIBE_ALL_MESSAGE_NAME)
  }
}
