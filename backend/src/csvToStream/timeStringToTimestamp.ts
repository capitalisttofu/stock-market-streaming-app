export const timeStringToAvroTime = (timeString: string) => {
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
  const millis = Math.round(Number(`0.${match[4]}`) * 1000)

  return (hours * 3600 + minutes * 60 + seconds) * 1000 + millis
}

export const dateStringToAvroDate = (timeString: string) => {
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

  const date = new Date(Date.UTC(year, month - 1, day))
  const avroDate = Math.floor(date.getTime() / (1000 * 60 * 60 * 24))

  return avroDate
}