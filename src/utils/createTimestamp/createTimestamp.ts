const EPOCH_START = 163400000000

/**
 * Returns the number of milliseconds since the Unix Epoch.
 */
export const createTimestamp = (): number => {
  return new Date().getTime()
}

export const createTimestamp32 = (): number => {
  return Math.trunc(createTimestamp() / 10) - EPOCH_START
}
