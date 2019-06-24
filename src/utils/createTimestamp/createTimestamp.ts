const EPOCH_START = 155000000000

export const createTimestamp = (): number => {
  return new Date().getTime()
}

export const createTimestamp32 = (): number => {
  return Math.trunc(createTimestamp() / 10) - EPOCH_START
}
