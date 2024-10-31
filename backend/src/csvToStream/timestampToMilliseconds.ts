export const timestampToMilliseconds = (timestamp: string) => {
  const [hours, minutes, secondsAndMilliseconds] = timestamp.split(':')
  const [seconds, milliseconds] = secondsAndMilliseconds.split('.').map(Number)

  return (
    Number(hours) * 60 * 60 * 1000 +
    Number(minutes) * 60 * 1000 +
    seconds * 1000 +
    milliseconds
  )
}
