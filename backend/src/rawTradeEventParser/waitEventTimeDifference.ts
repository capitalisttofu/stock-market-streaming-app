import {
  REALTIME_DATA_PRODUCTION_END_HOUR,
  REALTIME_DATA_PRODUCTION_START_HOUR,
  WAIT_TIME_DIFFERENCE_BETWEEN_EVENTS,
} from '../constants'

const maxOutOfOrderTimeDifferenceMillis = 500

const millisecondsToHours = (milliseconds: number) => {
  return Math.floor(milliseconds / 3_600_000)
}

/**
 * @returns the time of the current event in milliseconds
 */
export const waitEventTimeDifference = async (
  curEventTimeMillis: number,
  prevEventTimeMillis?: number,
) => {
  if (!WAIT_TIME_DIFFERENCE_BETWEEN_EVENTS) return undefined

  // No previous event to compare to
  if (prevEventTimeMillis === undefined) return curEventTimeMillis

  const timeDifference = curEventTimeMillis - prevEventTimeMillis
  if (timeDifference < -maxOutOfOrderTimeDifferenceMillis) {
    console.log(
      `Events are in incorrect order. Time difference: ${timeDifference}`,
    )

    return curEventTimeMillis
  }

  const timeHour = millisecondsToHours(curEventTimeMillis)
  // timeHour is between REALTIME_DATA_PRODUCTION_START_HOUR and REALTIME_DATA_PRODUCTION_END_HOUR
  if (
    timeHour >= REALTIME_DATA_PRODUCTION_START_HOUR &&
    timeHour < REALTIME_DATA_PRODUCTION_END_HOUR
  ) {
    // Wait the time difference
    await new Promise((resolve) => setTimeout(resolve, timeDifference))
  }

  return curEventTimeMillis
}
