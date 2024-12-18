import { producer } from '../lib/kafka'
import { produceRawTradeData } from './produceRawTradeData'
import { parseHeaders, parseTradeData } from './parseTradeData'
import * as fs from 'fs'
import * as readline from 'readline'
import {
  rawDataDirectory,
  SKIP_DATE_MODIFICATION,
  SKIP_DISCARDED_DATA,
} from '../constants'
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
let FIRST_WAIT_STARTED = false

export const main = async () => {
  let scriptStartDateMillis = new Date().getTime()

  console.log('ScriptStartDate')

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

      let diffMsSum = 0

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

        if (
          SKIP_DISCARDED_DATA &&
          (data?.tradingDate === undefined ||
            data.tradingTime === undefined ||
            data.lastTradePrice === undefined)
        ) {
          continue
        }

        if (data) {
          if (data.tradingDate && data.tradingTime) {
            const dataMillis = daysAndTimeToMillis(
              data.tradingDate,
              data.tradingTime,
            )

            if (!SKIP_DATE_MODIFICATION) {
              // If the event has happened after the "now" time
              if (dataMillis > CURRENT_DATE_MILLIS) {
                if (!FIRST_WAIT_STARTED) {
                  console.log(
                    '\n\n\nREACHED TARGET CURRENT DATE, BEGIN SLOWING EVENTS AND WAITING!!!\n\n\n',
                  )
                  console.log(
                    'RESETTING SCRIPT START DATE, SMALL INCONSISTENCY IN DATA EXPECTED',
                  )
                  scriptStartDateMillis = new Date().getTime()
                  FIRST_WAIT_STARTED = true
                }

                const currentPrevEventMillis = PREV_EVENT_MILLIS ?? dataMillis

                PREV_EVENT_MILLIS = await waitEventTimeDifference(
                  dataMillis,
                  PREV_EVENT_MILLIS,
                )

                const diffMs = PREV_EVENT_MILLIS - currentPrevEventMillis
                diffMsSum += diffMs
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
          }

          datapoints.push(data)
        }

        // Produce raw trade data points in given batch size or if the wait time has exceeded 500ms
        if (
          datapoints.length % PRODUCE_DATA_BATCH_SIZE === 0 ||
          diffMsSum > 1000
        ) {
          await produceRawTradeData(datapoints)
          datapoints = []
          diffMsSum = 0
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
