import { BACKEND_URI } from './constants'
import { BuySellEvent, EMAResultEvent, TradeEvent } from './types'

export async function fetchTradeEvents(symbol: string) {
  try {
    const response = await fetch(`${BACKEND_URI}/trade_events/${symbol}`)
    if (!response.ok) {
      throw new Error(
        `Error fetching trade events: ${response.status} ${response.statusText}`,
      )
    }
    const tradeEvents = await response.json()
    return tradeEvents as Array<TradeEvent>
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function fetchEmaEvents(symbol: string) {
  try {
    const response = await fetch(`${BACKEND_URI}/ema_events/${symbol}`)
    if (!response.ok) {
      throw new Error(
        `Error fetching emaj events: ${response.status} ${response.statusText}`,
      )
    }
    const emaEvents = await response.json()
    return emaEvents as Array<EMAResultEvent>
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function fetchBuySellEvents() {
  try {
    const response = await fetch(`${BACKEND_URI}/buysell_events`)
    if (!response.ok) {
      throw new Error(
        `Error fetching buy sell events events: ${response.status} ${response.statusText}`,
      )
    }
    const buySellEvents = await response.json()
    return buySellEvents as Array<BuySellEvent>
  } catch (error) {
    console.error(error)
    return []
  }
}
