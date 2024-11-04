import { google, SecType } from '../../generatedProto/compiled'
import { producer } from '../lib/kafka'
import { produceRawTradeData } from './produceRawTradeData'
import { parseHeaders, parseTradeData } from './parseTradeData'
import * as fs from 'fs'
import * as readline from 'readline'
import { rawDataDirectory } from '../constants'

export type ParsedRawData = {
  id: string
  secType: SecType
  lastTradePrice?: number
  tradingDate?: google.protobuf.Timestamp
  tradingTime?: google.protobuf.Timestamp
}

export const main = async () => {
  await producer.connect()

  try {
    // Find the csv files
    const filesInDir = fs.readdirSync(rawDataDirectory)
    const csvFiles = filesInDir
      .filter((fileName) => fileName.endsWith('.csv'))
      .toSorted()

    for await (const fileName of csvFiles) {
      // Load the csv file
      const csvFilePath = rawDataDirectory + '/' + fileName
      const fileStream = fs.createReadStream(csvFilePath)

      const readLineInterface = readline.createInterface({
        input: fileStream,
      })

      let headers
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

        // Produce raw trade data
        if (data) await produceRawTradeData(data)
      }
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
