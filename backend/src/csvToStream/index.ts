import { producer } from '../lib/kafka'
import { produceRawTradeData } from './produceRawTradeData'
import { parseHeaders, parseTradeData } from './parseTradeData'
import * as fs from 'fs'
import * as readline from 'readline'
import { rawDataDirectory } from '../constants'
import * as dayjs from 'dayjs'
import { SecType } from '../secType'
import { parseNowDateEnv } from '../lib/parseEnvNowString'
import { waitEventTimeDifference } from '../lib/waitEventTimeDifference'
import { modifyTimestamp } from './modifyTimestamp'

export type ParsedRawData = {
  id: string
  secType: SecType
  lastTradePrice?: number
  tradingDate?: number
  tradingTime?: number
}

const daysAndTimeToMillis = (days: number, millis: number) => {
  return days * 24 * 60 * 60 * 1000 + millis
}

const LOG_EVERY_X_LINES_PROCESSED = 100_000
const PRODUCE_DATA_BATCH_SIZE = 10_000
const CURRENT_DATE_MILLIS = parseNowDateEnv().getTime()
let PREV_EVENT_MILLIS: undefined | number = undefined

export const main = async () => {
  const scriptStartDateMillis = new Date().getTime()
  await producer.connect()

  try {
    // Find the csv files
    const filesInDir = fs.readdirSync(rawDataDirectory)
    const csvFiles = filesInDir
      .filter((fileName) => fileName.endsWith('.csv'))
      .toSorted()

    for await (const fileName of csvFiles) {
      const fileStartTime = dayjs()
      console.log('Processing file', fileName)
      let lineCounter = 0

      // Load the csv file
      const csvFilePath = rawDataDirectory + '/' + fileName
      const fileStream = fs.createReadStream(csvFilePath)

      const readLineInterface = readline.createInterface({
        input: fileStream,
      })

      let headers

      let datapoints: Array<ParsedRawData> = []

      for await (const line of readLineInterface) {
        // Ignore comments
        if (line.startsWith('#')) continue

        // First row contains the header
        if (headers === undefined) {
          headers = parseHeaders(line)
          continue
        }

        // Parse each row of trade data
        const data = parseTradeData(line, headers)
        if (data) {
          if (data.tradingDate && data.tradingTime) {
            const dataMillis = daysAndTimeToMillis(
              data.tradingDate,
              data.tradingTime,
            )

            // If the event has happened after the "now" time
            if (dataMillis > CURRENT_DATE_MILLIS) {
              PREV_EVENT_MILLIS = await waitEventTimeDifference(
                dataMillis,
                PREV_EVENT_MILLIS,
              )
            }

            // Modifying timestamp to use the current time in Flink instead of a watermark
            const modifiedTimestamp = modifyTimestamp(
              dataMillis,
              CURRENT_DATE_MILLIS,
              scriptStartDateMillis,
            )
            data.tradingTime = modifiedTimestamp.time
            data.tradingDate = modifiedTimestamp.days
          }

          datapoints.push(data)
        }

        // Produce raw trade data points
        if (datapoints.length % PRODUCE_DATA_BATCH_SIZE === 0) {
          await produceRawTradeData(datapoints)
          datapoints = []
        }

        lineCounter++

        if (lineCounter % LOG_EVERY_X_LINES_PROCESSED === 0) {
          console.log(new Date().toISOString())
          console.log(`Total lines processed so far: ${lineCounter}`)
        }
      }

      console.log('Processing file complete:', fileName)
      console.log(
        'Time elapsed (minutes)',
        dayjs().diff(fileStartTime, 'minute'),
      )
    }
    console.log('All messages produced successfully')
  } catch (e) {
    console.log('Error occured')
    console.log(e)
  } finally {
    await producer.disconnect()
    process.exit()
  }
}

void main()
