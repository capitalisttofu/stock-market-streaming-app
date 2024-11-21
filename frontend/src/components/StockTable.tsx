import { useState } from 'react'
import { handleSubscribe, handleUnsubscribe } from '../socket'
import { Stock } from '../types'
import './StockTable.css'

const compareStocks = (stock1: Stock, stock2: Stock) => {
  return stock1.symbol > stock2.symbol ? 1 : -1
}

interface StockTableProps {
  visualizedSymbol?: string
  setVisualizedSymbol: React.Dispatch<React.SetStateAction<string | undefined>>
  stocks: Stock[]
  selectAllStocks: () => void
  selectNoStocks: () => void
  selectStock: (stockSymbol: string) => void
}

const StockTable = (props: StockTableProps) => {
  const [subscribeAll, setSubscribeAll] = useState(false)

  const visualizeStock = (symbol: string) => {
    props.setVisualizedSymbol(symbol)
  }

  const handleSelection = (stock: Stock) => {
    if (stock.selected) {
      handleUnsubscribe(stock.symbol)
    } else {
      handleSubscribe(stock.symbol)
    }

    props.selectStock(stock.symbol)
  }

  const handleSubscribeAll = () => {
    setSubscribeAll(true)
    handleSubscribe()
    props.selectAllStocks()
  }

  const handleSubscribeNone = () => {
    setSubscribeAll(false)
    handleUnsubscribe()
    props.selectNoStocks()
  }

  return (
    <div className="container">
      <div className="header-container">
        <div className="header-text">
          <h2>Stocks</h2>
          <p className="description">
            Choose stocks to visualize and get buy and sell recommendations. If
            one wishes to select a subset of stocks, choose "Subscribe to None"
            and choose the stocks manually. New stocks are added to the list
            loaded whenever they events start appearing
          </p>
        </div>
        <div className="table-controls">
          <button onClick={handleSubscribeAll}>Subscribe to All</button>
          <button onClick={handleSubscribeNone}>Subscribe to None</button>
        </div>
      </div>
      <table className="stocks-table">
        <thead>
          <tr>
            <th>Subscribe</th>
            <th>Symbol</th>
            <th>Advice</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {props.stocks.sort(compareStocks).map((stock) => (
            <tr key={stock.symbol}>
              <td>
                <input
                  type="checkbox"
                  checked={subscribeAll || stock.selected}
                  onChange={() => handleSelection(stock)}
                  disabled={subscribeAll}
                />
              </td>
              <td>{stock.symbol}</td>
              <td>{stock.advice}</td>
              <td>
                <button
                  onClick={() => visualizeStock(stock.symbol)}
                  disabled={stock.symbol == props.visualizedSymbol}
                >
                  Visualize
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StockTable
