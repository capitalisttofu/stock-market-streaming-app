import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { BACKEND_URI, TRADE_EVENT_MESSAGE_NAME } from '../constants'
import { TradeEvent } from '../types/eventTypes'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts/highstock'
import './App.css'

//const tumblingWindowSize = 5 * 60 * 1000

const App = () => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)
  const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([])

  // Simulating the current date. Start with the earliest date possible
  const [lastEventDate, setLastEventDate] = useState(0)

  // Default is 15 minutes in milliseconds
  const [timeInterval, setTimeInterval] = useState(15 * 60 * 1000)
  const [showEMA, setShowEMA] = useState(false) // False shows price

  const getDatapointsPrice = () => {
    return tradeEvents.map((event) => [event.timestamp, event.lasttradeprice])
  }

  useEffect(() => {
    if (chartComponentRef.current && tradeEvents.length > 0) {
      const newTradeEvent = tradeEvents[tradeEvents.length - 1]
      const newPoint = [newTradeEvent.timestamp, newTradeEvent.lasttradeprice]

      setLastEventDate(newTradeEvent.timestamp)

      const series = chartComponentRef.current.chart.series
      series[0].addPoint(newPoint, true, false, false)
    }
  }, [tradeEvents])

  const options: Highcharts.Options = {
    chart: {
      type: 'line',
    },
    credits: {
      enabled: false,
    },
    navigator: {
      enabled: false,
    },
    rangeSelector: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: /*showEMA
      ? [
          {
            name: 'EMA 38',
            data: getDatapointsPrice(),
            type: 'line',
          },
          {
            name: 'EMA 100',
            data: getDatapointsPrice(),
            type: 'line',
          },
        ]
      :*/ [
      {
        name: 'Trade data',
        data: getDatapointsPrice(),
        type: 'line',
      },
    ],
    xAxis: {
      type: 'datetime',
      min: lastEventDate - timeInterval,
      max: lastEventDate + timeInterval * 0.1,
      ordinal: false,
    },
    yAxis: {
      type: 'linear',
      title: {
        text: 'Price',
      },
      labels: {
        format: '{value:.0f}', // round to the nearest integer
      },
      opposite: false,
    },
    legend: {
      enabled: showEMA,
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
    },
    accessibility: {
      enabled: false, // Disable an accessibility warning
    },
  }

  useEffect(() => {
    const socket = io(BACKEND_URI)

    socket.on(TRADE_EVENT_MESSAGE_NAME, (message) => {
      const event: TradeEvent = message.message

      setTradeEvents((prevMessages) => [...prevMessages, event])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div>
      <h1>Stock Market Streaming App</h1>
      <div>
        <div>
          <button onClick={() => setShowEMA(false)}>Show Price</button>
          <button onClick={() => setShowEMA(true)}>Show EMA</button>
        </div>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          ref={chartComponentRef}
        />
        <div>
          <button onClick={() => setTimeInterval(15 * 60 * 1000)}>
            15 Min
          </button>
          <button onClick={() => setTimeInterval(30 * 60 * 1000)}>
            30 Min
          </button>
          <button onClick={() => setTimeInterval(60 * 60 * 1000)}>
            1 Hour
          </button>
          <button onClick={() => setTimeInterval(2 * 60 * 60 * 1000)}>
            2 Hours
          </button>
          <button onClick={() => setTimeInterval(12 * 60 * 60 * 1000)}>
            12 Hours
          </button>
          <button onClick={() => setTimeInterval(24 * 60 * 60 * 1000)}>
            24 Hours
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
