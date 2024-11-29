// All timestamps are in milliseconds since the epoch
export const modifyTimestamp = (
  dataTimestamp: number,
  nowTimestamp: number,
  scriptStartTimestamp: number,
) => {
  const newDateMillis = scriptStartTimestamp - (nowTimestamp - dataTimestamp)

  const midnightNewDate = new Date(newDateMillis)
  midnightNewDate.setHours(0, 0, 0, 0)

  return {
    days: Math.floor(newDateMillis / (1000 * 60 * 60 * 24)),
    time: newDateMillis - midnightNewDate.getTime(),
  }
}
