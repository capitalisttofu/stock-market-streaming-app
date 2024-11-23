import { io, Socket } from 'socket.io-client'
import {
  ALL_SYMBOLS_MESSAGE_NAME,
  BACKEND_URI,
  BUY_SELL_ADVICE_MESSAGE_NAME,
  EMA_RESULT_MESSAGE_NAME,
  NEW_SYMBOL_MESSAGE_NAME,
  SUBSCRIBE_MESSAGE_NAME,
  TRADE_EVENT_MESSAGE_NAME,
  UNSUBSCRIBE_MESSAGE_NAME,
} from './constants'
import { BuySellEvent, EMAResultEvent, TradeEvent } from './types'

let socket: Socket | undefined = undefined

export const initializeSocket = (
  setStocks: (stockStrings: string[]) => void,
  setTradeEvents: React.Dispatch<React.SetStateAction<TradeEvent[]>>,
  setEMAEvents: React.Dispatch<React.SetStateAction<EMAResultEvent[]>>,
  setBuyAndSellEvents: React.Dispatch<React.SetStateAction<BuySellEvent[]>>,
) => {
  socket = io(BACKEND_URI)

  socket.on(ALL_SYMBOLS_MESSAGE_NAME, (stockStrings: string[]) => {
    setStocks(stockStrings)
  })

  socket.on(NEW_SYMBOL_MESSAGE_NAME, (stockString: string) => {
    setStocks([stockString])
  })

  socket.on(TRADE_EVENT_MESSAGE_NAME, (event: TradeEvent) => {
    console.log(event)
    setTradeEvents((prevEvents) => [...prevEvents, event])
  })

  socket.on(EMA_RESULT_MESSAGE_NAME, (event: EMAResultEvent) => {
    console.log(event)
    setEMAEvents((prevEvents) => [...prevEvents, event])
  })

  socket.on(BUY_SELL_ADVICE_MESSAGE_NAME, (event: BuySellEvent) => {
    setBuyAndSellEvents((prevEvents) => [...prevEvents, event])
  })

  return () => {
    socket?.disconnect()
  }
}

export const handleSubscribe = (symbol: string) => {
  socket?.emit(SUBSCRIBE_MESSAGE_NAME, symbol)
}

export const handleUnsubscribe = (symbol: string) => {
  socket?.emit(UNSUBSCRIBE_MESSAGE_NAME, symbol)
}
