import { useEffect, useRef, useState } from 'react'
import './App.css'
import Chart from './Chart'
import StockTable from './StockTable'
import { BuySellEvent, EMAResultEvent, TradeEvent } from '../types'
import { useStockData } from '../state/useStockData'
import { handleSubscribe, handleUnsubscribe, initializeSocket } from '../socket'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const adviceToString = (adviceString: string) => {
  if (adviceString === 'S') return 'SELL'
  if (adviceString === 'B') return 'BUY'
}

const App = () => {
  const stockState = useStockData()

  const [visualizedSymbol, setVisualizedSymbol] = useState<string | undefined>()
  const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([])
  const [EMAEvents, setEMAEvents] = useState<EMAResultEvent[]>([])
  const timersRef = useRef<number[]>([])

  const handleBuySellEvent = (event: BuySellEvent) => {
    const adviceString = adviceToString(event.buy_or_sell_action)
    if (adviceString === undefined) return

    if (stockState.setStockAdvice(event.symbol, adviceString)) {
      toast.info(`${adviceString} event from symbol ${event.symbol}`)

      const timer = setTimeout(() => {
        // Remove advice after 10 seconds
        stockState.removeStockAdvice(event.symbol)

        // Remove timer from Ref
        timersRef.current = timersRef.current.filter((id) => id !== timer)
      }, 10000)

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
