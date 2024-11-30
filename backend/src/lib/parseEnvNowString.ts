import { NOW_DATE } from '../constants'

const DEFAULT_DATE = "2021-08-11T13:00:01Z"

export const parseNowDateEnv = () => {
  const regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/
  const match = NOW_DATE?.match(regex)

  if (match && NOW_DATE) {
    const date = new Date(NOW_DATE)
    console.log(`The date used to simulate the 'current' date: ${date.toISOString()}`)
    return date
  }

  // Return default date
  const date = new Date(DEFAULT_DATE)
  console.log(
    `Falling back to default simulation timestamp (${date.toISOString()}), since NOW_DATE env is incorrectly formatted: ${NOW_DATE}`,
  )
  return date
}
