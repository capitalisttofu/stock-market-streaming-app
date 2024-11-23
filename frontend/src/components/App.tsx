import { useEffect, useState } from 'react'
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
  return ''
}

const App = () => {
  const {
    stocks,
    setStocks,
    selectAllStocks,
    selectNoStocks,
    selectStock,
    setStockAdvice,
    removeStockAdvice,
  } = useStockData()

  const [visualizedSymbol, setVisualizedSymbol] = useState<string | undefined>()
  const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([])
  const [EMAEvents, setEMAEvents] = useState<EMAResultEvent[]>([])
  const [buyAndSellEvents, setBuyAndSellEvents] = useState<BuySellEvent[]>([])

  useEffect(() => {
    return initializeSocket(
      setStocks,
      setTradeEvents,
      setEMAEvents,
      setBuyAndSellEvents,
    )
  }, [])

  useEffect(() => {
    if (buyAndSellEvents.length < 1) return
    const lastBuySellEvent = buyAndSellEvents[buyAndSellEvents.length - 1]
    const adviceString = adviceToString(lastBuySellEvent.buy_or_sell_action)

    // If user is subscribed to stock
    if (setStockAdvice(lastBuySellEvent.symbol, adviceString)) {
      toast.info(`${adviceString} event from symbol ${lastBuySellEvent.symbol}`)

      // Remove advice after 10 seconds
      const timer = setTimeout(
        () => removeStockAdvice(lastBuySellEvent.symbol),
        10000,
      )

      return () => {
        clearTimeout(timer)
      }
    }
  }, [buyAndSellEvents])

  const loadPastEvents = async () => {
    // TODO: load events from database here:
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
        stocks={stocks}
        selectAllStocks={selectAllStocks}
        selectNoStocks={selectNoStocks}
        selectStock={selectStock}
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
