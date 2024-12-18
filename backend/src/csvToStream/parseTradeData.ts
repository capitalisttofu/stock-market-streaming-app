import { ParsedRawData } from '.'
import { validateSecType } from '../secType'
import {
  dateStringToAvroDate,
  timeStringToAvroTime,
} from './timeStringToTimestamp'

/**
 * Parses a row of a trade data csv file
 */
export const parseTradeData = (
  csvRowString: string,
  headersToIndex: { [key: string]: number | undefined },
) => {
  const row = csvRowString
    .split(',')
    .map((field) => (field.trim().length > 0 ? field.trim() : undefined))

  const idIndex = headersToIndex['ID']
  const secTypeIndex = headersToIndex['SecType']
  if (secTypeIndex == undefined || idIndex == undefined) return undefined

  // Validata index and secType
  const index = row[idIndex]
  const secType = row[secTypeIndex]
    ? validateSecType(row[secTypeIndex])
    : undefined

  if (!secType || !index) {
    console.log(
      `Invalid index or secType. Index: ${index}. Sectype: ${secType}`,
    )
    return
  }

  // Validate the other attributes
  const tradingDateIndex = headersToIndex['Trading date']
  const tradingTimeIndex = headersToIndex['Trading time']
  const lastTradeIndex = headersToIndex['Last']
  const lastTradePrice = lastTradeIndex
    ? Number(row[lastTradeIndex])
    : undefined

  return {
    id: index,
    secType: secType,
    lastTradePrice:
      lastTradePrice !== undefined && !isNaN(lastTradePrice)
        ? lastTradePrice
        : undefined,
    tradingDate:
      tradingDateIndex && row[tradingDateIndex] !== undefined
        ? dateStringToAvroDate(row[tradingDateIndex])
        : undefined,
    tradingTime:
      tradingTimeIndex && row[tradingTimeIndex] !== undefined
        ? timeStringToAvroTime(row[tradingTimeIndex])
        : undefined,
  } satisfies ParsedRawData
}

/**
 * Parses the headers of a financial data csv file
 * @param line of the csv file. The line must contain the headers
 * @returns a collection where each header attribute is mapped to its index in the @line
 */
export const parseHeaders = (line: string) => {
  return Object.fromEntries(
    line.split(',').map((header, index) => [header.trim(), index]),
  )
}
