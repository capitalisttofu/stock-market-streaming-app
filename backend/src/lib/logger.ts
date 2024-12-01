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
  windowDelaySumMs: number = 0
  windowInterval: NodeJS.Timeout | null = null
  latestEventTime: number = 0
  minWindowDelayMs: number = Infinity
  maxWindowDelayMs: number = -1

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
      const diff = new Date().valueOf() - comparisonTimestamp
      this.windowDelaySumMs += diff

      if (diff > this.maxWindowDelayMs) {
        this.maxWindowDelayMs = diff
      }
      if (diff < this.minWindowDelayMs) {
        this.minWindowDelayMs = diff
      }
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
    this.writeToLog(
      `Starting window interval, stats every ${this.windowLengthSeconds}s`,
    )
    this.windowInterval = setInterval(() => {
      const windowEventsPerSec = (
        this.windowCount / this.windowLengthSeconds
      ).toFixed(2)

      let text = `TotalEvents: ${this.eventCount}  WindowEvents: ${this.windowCount}  WindowEventsPerSec ${windowEventsPerSec}  `

      // If windowDelaySum is larger than 0, then max and min delays are also defined
      if (this.windowDelaySumMs > 0) {
        const windowAvgDelay = calculateAvgDelay(
          this.windowCount,
          this.windowDelaySumMs,
        ).toFixed(2)
        text += `WindowAvgDelayMs: ${windowAvgDelay}  WindowMinDelayMs: ${this.minWindowDelayMs.toFixed(2)}  WindowMaxDelayMs: ${this.maxWindowDelayMs.toFixed(2)}  `
      }

      if (this.latestEventTime) {
        text += `LatestEventTime: ${new Date(this.latestEventTime).toISOString()}`
      }

      this.writeToLog(text)
      this.windowCount = 0
      this.windowDelaySumMs = 0
      this.maxWindowDelayMs = -1
      this.minWindowDelayMs = Infinity
    }, this.windowLengthSeconds * 1000)
  }

  closeLogger() {
    if (this.windowInterval) {
      clearInterval(this.windowInterval)
    }
    this.logFile.end()
  }
}
