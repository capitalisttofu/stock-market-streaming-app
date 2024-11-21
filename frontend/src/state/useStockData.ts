import { useState } from 'react'
import { Stock } from '../types'

const stockStringToStock = (stockString: string) => {
  return {
    symbol: stockString,
    selected: false,
  } as Stock
}

export const useStockData = () => {
  const [stocks, setStockData] = useState<Stock[]>([])

  const setStocks = (stockStrings: string[]) => {
    const newStocks: Stock[] = stockStrings.map(stockStringToStock)

    setStockData((prev) => {
      // Remove duplicates
      const combined = [...prev]
      newStocks.forEach((newStock) => {
        if (!combined.some((item) => item.symbol === newStock.symbol)) {
          combined.push(newStock)
        }
      })
      return combined
    })
  }

  /**
   * If a stock is selected, it unselects it. Otherwise it selects it
   */
  const selectStock = (symbol: string) => {
    setStockData(
      stocks.map((stock) =>
        stock.symbol === symbol
          ? { ...stock, selected: !stock.selected }
          : stock,
      ),
    )
  }

  const selectAllStocks = () => {
    setStockData(stocks.map((stock) => ({ ...stock, selected: true })))
  }

  const selectNoStocks = () => {
    setStockData(stocks.map((stock) => ({ ...stock, selected: false })))
  }

  return { stocks, setStocks, selectAllStocks, selectNoStocks, selectStock }
}
