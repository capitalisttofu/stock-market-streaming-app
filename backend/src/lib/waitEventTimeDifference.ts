const maxOutOfOrderTimeDifferenceMillis = 500

/**
 * @returns the time of the current event in milliseconds
 */
export const waitEventTimeDifference = async (
  curEventTimeMillis: number,
  prevEventTimeMillis?: number,
) => {
  // No previous event to compare to
  if (prevEventTimeMillis === undefined) return curEventTimeMillis

  const timeDifference = curEventTimeMillis - prevEventTimeMillis
  if (timeDifference < -maxOutOfOrderTimeDifferenceMillis) {
    console.log(
      `Events are in incorrect order. Time difference: ${timeDifference}`,
    )

    return curEventTimeMillis
  }

  // Wait the time difference
  await new Promise((resolve) => setTimeout(resolve, timeDifference))

  return curEventTimeMillis
}
