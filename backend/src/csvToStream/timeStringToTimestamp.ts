import { google } from "../../generatedProto/compiled";

export const timeStringToTimestamp = (timeString: string) => {
  // "HH:MM:SS.sss" or "HH:MM:SS.ssss"
  const timeRegex = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3,4})$/
  const match = timeString.match(timeRegex)

  if (!match) {
    console.log("Invalid timestamp")
    return
  }

  const hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const seconds = parseInt(match[3])
  const millis = parseInt(match[4].padEnd(4, '0'))

  return {
    seconds: hours * 3600 + minutes * 60 + seconds,
    nanos: millis * 1000000
  } as google.protobuf.Timestamp
}

export const dateStringToTimestamp = (timeString: string) => {
  // "DD-MM-YYYY"
  const timeRegex = /^(\d{2})-(\d{2})-(\d{4})$/
  const match = timeString.match(timeRegex)

  if (!match) {
    console.log("Invalid timestamp")
    return
  }

  const day = parseInt(match[1])
  const month = parseInt(match[2])
  const year = parseInt(match[3])

  const date = new Date(year, month - 1, day)

  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: (date.getTime() % 1000) * 1e6
  } as google.protobuf.Timestamp
}