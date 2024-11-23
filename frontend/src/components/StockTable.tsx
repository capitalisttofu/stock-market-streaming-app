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
  return (
    <div className="container">
      <div className="header-container">
        <div className="header-text">
          <h2>Stocks</h2>
          <p className="description">
            Select stocks to receive buy and sell recommendations.
            New stocks are automatically added to the list whenever an event
            involving their symbol occurs. You can also visualize stocks.
          </p>
        </div>
        <div className="table-controls">
          <button onClick={props.selectAllStocks}>Subscribe to All</button>
          <button onClick={props.selectNoStocks}>Subscribe to None</button>
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
                  checked={stock.selected}
                  onChange={() => props.selectStock(stock.symbol)}
                />
              </td>
              <td>{stock.symbol}</td>
              <td className="table-advice">{stock.advice}</td>
              <td>
                <button
                  onClick={() => props.setVisualizedSymbol(stock.symbol)}
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
