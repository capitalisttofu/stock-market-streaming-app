import { useState } from 'react'
import { Stock } from '../types'

const stockStringToStock = (stockString: string, selected: boolean) => {
  return {
    symbol: stockString,
    selected: selected,
  } as Stock
}

const adviceToString = (adviceString: string) => {
  if (adviceString === 'S') return 'SELL'
  if (adviceString === 'B') return 'BUY'
  return ''
}

export const useStockData = () => {
  const [stocks, setStockData] = useState<Stock[]>([])

  const allStocksSelected = () => {
    return stocks.length > 0 && stocks.every((stock) => stock.selected)
  }

  const setStocks = (stockStrings: string[]) => {
    // Stock is selected if all current stocks are also selected
    const selectNewStock = allStocksSelected()
    const newStocks = stockStrings.map((str) =>
      stockStringToStock(str, selectNewStock),
    )

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
    // Returns false if symbol does not exist or stock is not selected
    if (!stocks.some((stock) => stock.symbol === symbol && stock.selected)) {
      return false
    }

    setStockData(
      stocks.map((stock) =>
        stock.symbol === symbol
          ? { ...stock, advice: adviceToString(advice) }
          : stock,
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
