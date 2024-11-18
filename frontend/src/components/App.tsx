import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { BACKEND_URI, TRADE_EVENT_MESSAGE_NAME } from '../constants'
import { TradeEvent } from '../types/eventTypes'
import './App.css'

const App = () => {
  const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([])

  useEffect(() => {
    const socket = io(BACKEND_URI)

    socket.on(TRADE_EVENT_MESSAGE_NAME, (message) => {
      setTradeEvents((prevMessages) => [...prevMessages, message])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div>
      <h1>Stock Market Streaming App</h1>
      {tradeEvents.map((msg) => (
        <p key={msg.id}>{JSON.stringify(msg)}</p>
      ))}
    </div>
  )
}

export default App
