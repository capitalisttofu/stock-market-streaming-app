import { useEffect, useRef, useState } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts/highstock'
import { EMAResultEvent, TradeEvent } from '../types'
import './Chart.css'

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
  EMAEvents: EMAResultEvent[]
  visualizedSymbol: string
}

const Chart = (props: ChartProps) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  // Simulating the current date. Start with the earliest date possible
  const [lastEventMillis, setLastEventMillis] = useState(0)

  // Default is 15 minutes in milliseconds
  const [timeInterval, setTimeInterval] = useState(15 * 60 * 1000)

  const getDatapointsPrice = () => {
    const sameSymbol = props.tradeEvents.filter(
      (event) => event.symbol === props.visualizedSymbol,
    )
    return sameSymbol.map((event) => [event.timestamp, event.lasttradeprice])
  }

  const getDatapointsEMA = (emaJ: 38 | 100) => {
    const sameSymbol = props.EMAEvents.filter(
      (event) => event.symbol === props.visualizedSymbol,
    )

    const curEvents = sameSymbol.map((event) => [
      event.window_end,
      emaJ == 38 ? event.emaj_38 : event.emaj_100,
    ])
    const prevEvents = sameSymbol.map((event) => [
      event.window_start,
      emaJ == 38 ? event.prev_emaj_38 : event.prev_emaj_100,
    ])

    return prevEvents.concat(curEvents)
  }

  // Update lastEventMillis and add datapoint to chart whenever a new TradeEvent happens
  useEffect(() => {
    if (chartComponentRef.current && props.tradeEvents.length > 0) {
      const newTradeEvent = props.tradeEvents[props.tradeEvents.length - 1]
      const newPoint = [newTradeEvent.timestamp, newTradeEvent.lasttradeprice]

      // lastEventMillis is the current time; hence, the latest event is chosen
      if (newTradeEvent.timestamp > lastEventMillis) {
        setLastEventMillis(newTradeEvent.timestamp)
      }

      const series = chartComponentRef.current.chart.series
      series[0].addPoint(newPoint, true, false, true)
    }
  }, [props.tradeEvents])

  // Update lastEventMillis and add datapoint to chart whenever a new EMAEvent happens
  useEffect(() => {
    if (chartComponentRef.current && props.EMAEvents.length > 0) {
      const newEmaEvent = props.EMAEvents[props.EMAEvents.length - 1]

      const newPoint38Start = [
        newEmaEvent.window_start,
        newEmaEvent.prev_emaj_38,
      ]
      const newPoint100Start = [
        newEmaEvent.window_start,
        newEmaEvent.prev_emaj_100,
      ]

      const newPoint38End = [newEmaEvent.window_end, newEmaEvent.emaj_38]
      const newPoint100End = [newEmaEvent.window_end, newEmaEvent.emaj_100]

      // lastEventMillis is the current time; hence, the latest event is chosen
      if (newEmaEvent.window_end > lastEventMillis) {
        setLastEventMillis(newEmaEvent.window_end)
      }

      const series = chartComponentRef.current.chart.series
      series[0].addPoint(newPoint38Start, true, false, true)
      series[0].addPoint(newPoint38End, true, false, true)

      series[1].addPoint(newPoint100Start, true, false, true)
      series[1].addPoint(newPoint100End, true, false, true)
    }
  }, [props.EMAEvents])

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
    series: [
      {
        name: 'EMA 38',
        data: getDatapointsEMA(38),
        type: 'line',
        color: '#4682B4',
        yAxis: 1,
      },
      {
        name: 'EMA 100',
        data: getDatapointsEMA(100),
        type: 'line',
        color: '#FF0000',
        yAxis: 1,
      },
      {
        name: 'Trade price',
        data: getDatapointsPrice(),
        type: 'line',
        color: '#4B0082',
        yAxis: 0,
      },
    ],
    xAxis: {
      type: 'datetime',
      min: lastEventMillis - timeInterval,
      // Leave some space on the right hand side of the data curve
      max: lastEventMillis + timeInterval * 0.1,
      ordinal: false,
      plotBands: props.EMAEvents.map((event, index) => {
        return {
          from: event.window_start,
          to: event.window_end,
          color: index % 2 == 0 ? '#f0f0f0' : '#f5f5dc',
          label: {
            text: `window ${index}`,
            align: 'center',
            verticalAlign: 'bottom',
            y: 20, // Position the label below
          },
        }
      }),
    },
    annotations: [
      {
        labels: [
          {
            point: {
              x: Date.UTC(2021, 10, 8, 9, 3),
              y: 6.5,
              xAxis: 0,
              yAxis: 0,
            },
            text: 'Sell Event Triggered',
            align: 'right',
            verticalAlign: 'bottom',
          },
        ],
        shapes: [
          {
            type: 'path',

            stroke: 'gray',
          },
        ],
      },
    ],
    yAxis: [
      {
        type: 'linear',
        title: {
          text: 'Price',
        },
        labels: {
          format: '{value:.0f}', // round to the nearest integer
        },
        opposite: true,
      },
      {
        type: 'linear',
        title: {
          text: 'EMA',
        },
        labels: {
          format: '{value:.0f}', // round to the nearest integer
        },
      },
    ],
    legend: {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
    },
    accessibility: {
      enabled: false, // Disable an accessibility warning
    },
    tooltip: {
      shared: true, // Allow comparison of values in the same tooltip
    },
  }

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">
          {props.visualizedSymbol}, {new Date(lastEventMillis).toDateString()}
        </h2>
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
