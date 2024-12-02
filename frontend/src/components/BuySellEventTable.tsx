import { useState } from 'react'
import { BuySellEvent } from '../types'
import './table.css'

const compareBuySellEvents = (
  buySellEvent1: BuySellEvent,
  buySellEvent2: BuySellEvent,
) => {
  return buySellEvent1.window_end < buySellEvent2.window_end ? 1 : -1
}

interface BuySellEventProps {
  buySellEvents: BuySellEvent[]
}

const BuySellEventTable = (props: BuySellEventProps) => {
  const [filterText, setFilterText] = useState('')

  const filterBuySellEvents = (stocks: BuySellEvent[]) => {
    return stocks.filter((event) =>
      event.symbol.toLocaleLowerCase().includes(filterText.toLowerCase()),
    )
  }

  return (
    <div className="container">
      <div className="header-container">
        <div className="header-text">
          <h2>Buy and Sell Events</h2>
          <p className="description">
            The table includes previous buy and sell events, which the user has
            subscribed to.
          </p>
          <input
            placeholder="Search by symbol"
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>
      <table className="stocks-table">
        <thead>
          <tr>
            <th>Event time (window end)</th>
            <th>Symbol</th>
            <th>Advice</th>
          </tr>
        </thead>
        <tbody>
          {filterBuySellEvents(props.buySellEvents)
            .sort(compareBuySellEvents)
            .map((event) => (
              <tr key={event.symbol + event.window_end}>
                <td>{new Date(event.window_end).toUTCString()}</td>
                <td>{event.symbol}</td>
                {event.buy_or_sell_action === 'BUY' ? (
                  <td className="table-advice-green">
                    {event.buy_or_sell_action}
                  </td>
                ) : (
                  <td className="table-advice-red">
                    {event.buy_or_sell_action}
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default BuySellEventTable
