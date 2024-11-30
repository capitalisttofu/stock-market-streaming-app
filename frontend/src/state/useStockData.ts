import { useState } from 'react'
import { Stock } from '../types'

export const useStockData = () => {
  const [stocks, setStockData] = useState<Stock[]>([])

  const setStocks = (stockStrings: string[]) => {
    // Stock is selected if all current stocks are also selected.
    // If there are no stocks, the new stock is selected
    const selectNewStock = stocks.every((stock) => stock.selected)
    const newStocks = stockStrings.map((str) => {
      return { symbol: str, selected: selectNewStock } as Stock
    })

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

  const setStockAdvice = (symbol: string, advice: string) => {
    // Show advice if there are no stocks
    if (stocks.length === 0) return true

    // Returns false if symbol does not exist or stock is not selected
    if (!stocks.some((stock) => stock.symbol === symbol && stock.selected)) {
      return false
    }

    setStockData(
      stocks.map((stock) =>
        stock.symbol === symbol ? { ...stock, advice } : stock,
      ),
    )

    return true
  }

  const removeStockAdvice = (symbol: string) => {
    setStockData(
      stocks.map((stock) =>
        stock.symbol === symbol ? { ...stock, advice: undefined } : stock,
      ),
    )
  }

  return {
    stocks,
    setStocks,
    selectAllStocks,
    selectNoStocks,
    selectStock,
    setStockAdvice,
    removeStockAdvice,
  }
}
