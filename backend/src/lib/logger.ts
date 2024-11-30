import * as fs from 'fs'

type EventLoggerConstructorParams = {
  logFileName: string
  windowLengthSeconds: number
}

const calculateAvgDelay = (eventCount: number, delaySumMs: number) => {
  if (eventCount === 0) {
    return 0
  }
  const averageDelayMs = delaySumMs / eventCount
  return averageDelayMs
}

export class EventLogger {
  logFile: fs.WriteStream
  windowLengthSeconds: number
  eventCount: number = 0
  windowCount: number = 0
  delaySumMs: number = 0
  windowDelaySumMs: number = 0
  windowInterval: NodeJS.Timeout | null = null
  latestEventTime: number = 0

  constructor({
    logFileName,
    windowLengthSeconds,
  }: EventLoggerConstructorParams) {
    const isoString = new Date().toISOString()
    this.windowLengthSeconds = windowLengthSeconds
    this.logFile = fs.createWriteStream(
      `./logs/${logFileName}-${isoString}.log`,
      {
        flags: 'w',
      },
    )
  }

  addToMetrics(
    comparisonTimestamp: number | null,
    latestEventTime: number | null,
  ) {
    this.eventCount += 1
    this.windowCount += 1
    if (comparisonTimestamp) {
      const diff = comparisonTimestamp - new Date().valueOf()
      this.delaySumMs += diff
      this.windowDelaySumMs += diff
    }

    if (latestEventTime) {
      this.latestEventTime = latestEventTime
    }
  }

  writeToLog(text: string) {
    const isoString = new Date().toISOString()
    this.logFile.write(`${isoString}  ${text}\n`)
  }

  startWindowIntervalLogger() {
    this.windowInterval = setInterval(() => {
      let text = `Total Events: ${this.eventCount}. Window (${this.windowLengthSeconds}s) events: ${this.windowCount}. `
      if (this.eventCount > 0) {
        const totalAvgDelay = calculateAvgDelay(
          this.eventCount,
          this.delaySumMs,
        )
        text += `Total Avg Delay ms ${totalAvgDelay} `
      }

      if (this.windowDelaySumMs > 0) {
        const windowAvgDelay = calculateAvgDelay(
          this.windowCount,
          this.windowDelaySumMs,
        )
        text += `Window (${this.windowLengthSeconds}s) Avg Delay ms ${windowAvgDelay}. `
      }

      if (this.latestEventTime) {
        text += `Latest event time: ${new Date(this.latestEventTime).toISOString()}`
      }

      this.writeToLog(text)
      this.windowCount = 0
      this.windowDelaySumMs = 0
    }, this.windowLengthSeconds * 1000)
  }

  closeLogger() {
    if (this.windowInterval) {
      clearInterval(this.windowInterval)
    }
    this.logFile.end()
  }
}
