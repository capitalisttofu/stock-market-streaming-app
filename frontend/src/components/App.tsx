import { useEffect, useRef, useState } from 'react'
import './App.css'
import Chart from './Chart'
import StockTable from './StockTable'
import { BuySellEvent, EMAResultEvent, TradeEvent } from '../types'
import { useStockData } from '../state/useStockData'
import { handleSubscribe, handleUnsubscribe, initializeSocket } from '../socket'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const REMOVE_BUY_SELL_EVENT_AFTER_MILLIS = 30000

const App = () => {
  const stockState = useStockData()

  const [visualizedSymbol, setVisualizedSymbol] = useState<string | undefined>()
  const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([])
  const [EMAEvents, setEMAEvents] = useState<EMAResultEvent[]>([])
  const timersRef = useRef<number[]>([])

  const handleBuySellEvent = (event: BuySellEvent) => {
    const dateString = new Date(event.window_end).toISOString()

    if (
      stockState.setStockAdvice(
        event.symbol,
        `${event.buy_or_sell_action} (${dateString})`,
      )
    ) {
      toast.info(
        `${event.buy_or_sell_action} event from symbol ${event.symbol} at ${dateString}`,
      )

      const timer = setTimeout(() => {
        // Remove advice after REMOVE_BUY_SELL_EVENT_AFTER_MILLIS has passed
        stockState.removeStockAdvice(event.symbol)

        // Remove timer from Ref
        timersRef.current = timersRef.current.filter((id) => id !== timer)
      }, REMOVE_BUY_SELL_EVENT_AFTER_MILLIS)

      timersRef.current.push(timer)
    }
  }

  useEffect(() => {
    return initializeSocket(
      stockState.setStocks,
      setTradeEvents,
      setEMAEvents,
      handleBuySellEvent,
    )
  }, [])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id))
      timersRef.current = []
    }
  }, [])

  const loadPastEvents = async () => {
    // TODO: load events from database here
    //const eventsFromDatabase = Database.fetch({ symbol: visualizedSymbol })
    //setTradeEvents(prev => [...prev, eventsFromDatabase])
    //setEMAEvents(prev => [...prev, eventsFromDatabase])
  }

  useEffect(() => {
    if (visualizedSymbol === undefined) return

    handleUnsubscribe(visualizedSymbol)
    setTradeEvents([])
    setEMAEvents([])
    handleSubscribe(visualizedSymbol)

    loadPastEvents()
  }, [visualizedSymbol])

  return (
    <>
      <h1>Stock Market Streaming App</h1>
      {visualizedSymbol && (
        <Chart
          tradeEvents={tradeEvents}
          EMAEvents={EMAEvents}
          visualizedSymbol={visualizedSymbol}
        />
      )}
      <StockTable
        visualizedSymbol={visualizedSymbol}
        setVisualizedSymbol={setVisualizedSymbol}
        {...stockState}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export default App
