export interface TradeEvent {
  id: string
  symbol: string
  exchange: string
  sectype: string
  lasttradeprice: number
  timestamp: number
}

export interface BuySellEvent {
  symbol: string
  buy_or_sell_action: string
  window_start: number
  window_end: number
}

export interface EMAResultEvent {
  symbol: string
  emaj_38: number
  emaj_100: number
  prev_emaj_38: number
  prev_emaj_100: number
  window_start: number
  window_end: number
}

export interface Stock {
  symbol: string
  selected: boolean
  advice?: string
}
