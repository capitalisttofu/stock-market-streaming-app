import { useEffect, useRef, useState } from 'react'
import './app.css'
import Chart from './Chart'
import StockTable from './StockTable'
import { BuySellEvent, EMAResultEvent, TradeEvent } from '../types'
import { useStockData } from '../state/useStockData'
import { handleSubscribe, initializeSocket } from '../socket'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BuySellEventTable from './BuySellEventTable'
import { fetchBuySellEvents, fetchEmaEvents, fetchTradeEvents } from '../api'

const REMOVE_BUY_SELL_EVENT_AFTER_MILLIS = 30000
const MAX_TOAST_COUNT = 30
const CLOSE_TOAST_MILLIS = 3000

const App = () => {
  const stockState = useStockData()

  const [visualizedSymbol, setVisualizedSymbol] = useState<string | undefined>()
  const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([])
  const [EMAEvents, setEMAEvents] = useState<EMAResultEvent[]>([])
  const [buySellEvents, setBuySellEvents] = useState<BuySellEvent[]>([])
  const timersRef = useRef<number[]>([])

  const handleBuySellEvent = (event: BuySellEvent) => {
    const dateString = new Date(event.window_end).toUTCString()

    if (
      stockState.setStockAdvice(
        event.symbol,
        `${event.buy_or_sell_action} (${dateString})`,
      )
    ) {
      setBuySellEvents((prev) => [...prev, event])
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
    fetchBuySellEvents().then((events) => {
      setBuySellEvents((currentEvents) => {
        const newEvents = events.filter((e) => {
          return !currentEvents.some((currEv) => {
            return (
              currEv.buy_or_sell_action === e.buy_or_sell_action &&
              currEv.symbol === e.symbol &&
              e.window_end === currEv.window_end
            )
          })
        })

        const allEvents = [...newEvents, ...currentEvents]
        return allEvents
      })
    })

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

  useEffect(() => {
    if (visualizedSymbol === undefined) return

    setTradeEvents([])
    setEMAEvents([])
    handleSubscribe(visualizedSymbol)
    fetchTradeEvents(visualizedSymbol).then((data) => {
      setTradeEvents(data)
    })

    fetchEmaEvents(visualizedSymbol).then((data) => {
      setEMAEvents(data)
    })
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
      <div className="tables">
        <StockTable
          visualizedSymbol={visualizedSymbol}
          setVisualizedSymbol={setVisualizedSymbol}
          {...stockState}
        />
        <BuySellEventTable buySellEvents={buySellEvents} />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={CLOSE_TOAST_MILLIS}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        limit={MAX_TOAST_COUNT}
      />
    </>
  )
}

export default App
