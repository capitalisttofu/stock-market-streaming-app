import { useEffect, useRef, useState } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts/highstock'
import { TradeEvent } from '../types'
import './Chart.css'

//const tumblingWindowSizeMillis = 5 * 60 * 1000

const intervalButtons = [
  { text: '15 min', timeInMillis: 15 * 60 * 1000 },
  { text: '30 min', timeInMillis: 30 * 60 * 1000 },
  { text: '1 hour', timeInMillis: 60 * 60 * 1000 },
  { text: '2 hours', timeInMillis: 2 * 60 * 60 * 1000 },
  { text: '6 hours', timeInMillis: 6 * 60 * 60 * 1000 },
  { text: '12 hours', timeInMillis: 12 * 60 * 60 * 1000 },
  { text: '1 day', timeInMillis: 24 * 60 * 60 * 1000 },
  { text: '2 days', timeInMillis: 2 * 24 * 60 * 60 * 1000 },
  { text: '7 days', timeInMillis: 7 * 24 * 60 * 60 * 1000 },
]

interface ChartProps {
  tradeEvents: TradeEvent[]
  visualizedSymbol: string
}

const Chart = ({ tradeEvents, visualizedSymbol }: ChartProps) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  // Simulating the current date. Start with the earliest date possible
  const [lastEventMillis, setLastEventMillis] = useState(0)

  // Default is 15 minutes in milliseconds
  const [timeInterval, setTimeInterval] = useState(15 * 60 * 1000)
  const [showEMA, setShowEMA] = useState(false) // False shows price

  const getDatapointsPrice = () => {
    return tradeEvents
      .filter((event) => event.symbol === visualizedSymbol)
      .map((event) => [event.timestamp, event.lasttradeprice])
  }

  const getDatapointsEMA = (emaJ: 38 | 100) => {
    // TODO: implement this
    return []
  }

  useEffect(() => {
    if (chartComponentRef.current && tradeEvents.length > 0) {
      const newTradeEvent = tradeEvents[tradeEvents.length - 1]
      const newPoint = [newTradeEvent.timestamp, newTradeEvent.lasttradeprice]

      // lastEventMillis is the current time; hence, the latest event is chosen
      if (newTradeEvent.timestamp > lastEventMillis) {
        setLastEventMillis(newTradeEvent.timestamp)
      }

      const series = chartComponentRef.current.chart.series
      series[0].addPoint(newPoint, true, false, true)
    }
  }, [tradeEvents])

  /*useEffect(() => {
    if (chartComponentRef.current && emaEvents.length > 0) {
      const newEmaEvent = emaEvents[emaEvents.length - 1]
      const newPoint = [newEmaEvent.timestamp, newEmaEvent.lasttradeprice]

      setLastEventMillis(newEmaEvent.timestamp)

      const series = chartComponentRef.current.chart.series
      series[0].addPoint(, true, false, false)
      series[1].addPoint(, true, false, false)
    }
  }, [emaEvents])*/

  const options: Highcharts.Options = {
    chart: {
      type: 'line',
    },
    title: undefined,
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
    series: showEMA
      ? [
          {
            name: 'EMA 38',
            data: getDatapointsEMA(38),
            type: 'line',
          },
          {
            name: 'EMA 100',
            data: getDatapointsEMA(100),
            type: 'line',
          },
        ]
      : [
          {
            name: 'Trade data',
            data: getDatapointsPrice(),
            type: 'line',
          },
        ],
    xAxis: {
      type: 'datetime',
      min: lastEventMillis - timeInterval,
      // Leave some space on the right hand side of the data curve
      max: lastEventMillis + timeInterval * 0.1,
      ordinal: false,
    },
    yAxis: {
      type: 'linear',
      title: {
        text: showEMA ? 'EMA' : 'Price',
      },
      labels: {
        format: '{value:.0f}', // round to the nearest integer
      },
    },
    legend: {
      enabled: showEMA,
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
    },
    accessibility: {
      enabled: false, // Disable an accessibility warning
    },
  }

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">
          {visualizedSymbol}, {new Date(lastEventMillis).toDateString()}
        </h2>
        <div className="buttons">
          <button onClick={() => setShowEMA(true)} className="action-button">
            EMA
          </button>
          <button onClick={() => setShowEMA(false)} className="action-button">
            Price
          </button>
        </div>
      </div>
      <div className="chart-wrapper">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          ref={chartComponentRef}
        />
      </div>
      <div className="timeframe-buttons">
        {intervalButtons.map((option) => (
          <button
            key={option.text}
            className={`timeframe-button ${
              timeInterval === option.timeInMillis ? 'active' : ''
            }`}
            onClick={() => setTimeInterval(option.timeInMillis)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Chart
