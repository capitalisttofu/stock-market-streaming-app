const millisInDay = 1000 * 60 * 60 * 24

// All timestamps are in milliseconds since the epoch
export const modifyTimestamp = (
  dataTimestamp: number,
  nowTimestamp: number,
  scriptStartTimestamp: number,
) => {
  const newDateMillis = scriptStartTimestamp - (nowTimestamp - dataTimestamp)

  const days = Math.floor(newDateMillis / millisInDay)
  // Calculate remaining time after days
  const time = newDateMillis % millisInDay

  return {
    days,
    time,
  }
}
