import { useEffect, useState } from 'react'
import './App.css'
import Chart from './Chart'
import StockTable from './StockTable'
import { TradeEvent } from '../types'
import { useStockData } from '../state/useStockData'
import { initializeSocket } from '../socket'

const App = () => {
  const { stocks, setStocks, selectAllStocks, selectNoStocks, selectStock } =
    useStockData()

  const [visualizedSymbol, setVisualizedSymbol] = useState<string | undefined>()
  const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([])

  useEffect(() => {
    return initializeSocket(setStocks, setTradeEvents)
  }, [])

  return (
    <>
      <h1>Stock Market Streaming App</h1>
      {visualizedSymbol && (
        <Chart tradeEvents={tradeEvents} visualizedSymbol={visualizedSymbol} />
      )}
      <StockTable
        visualizedSymbol={visualizedSymbol}
        setVisualizedSymbol={setVisualizedSymbol}
        stocks={stocks}
        selectAllStocks={selectAllStocks}
        selectNoStocks={selectNoStocks}
        selectStock={selectStock}
      />
    </>
  )
}

export default App
