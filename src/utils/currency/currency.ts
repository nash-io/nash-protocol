import Int64Buffer from 'int64-buffer'

export function normalizeAmount(amount: string, precision: number): string {
  const amountSplit = amount.split('.')
  let _amount: string = amount

  if (precision === 0) {
    if (amountSplit.length === 1) {
      return amountSplit[0]
    } else {
      throw new Error(`to many decimals given expected: ${precision} got ${amountSplit[1].length}`)
    }
  }

  if (amountSplit.length === 1) {
    const head = amountSplit[0]
    const tail = ''.padStart(precision, '0')
    _amount = head + '.' + tail
  }

  if (amountSplit[1].length < precision) {
    const head = amountSplit[0]
    const tail = ''.padStart(precision - amountSplit[1].length, '0')
    _amount = head + '.' + amountSplit[1] + tail
  }

  if (amountSplit[1].length > precision) {
    _amount = amountSplit[0] + '.' + amountSplit[1].substring(0, precision)
  }

  return _amount.replace('.', '')
}

export function precisionDiff(amount: string, precision: number): number {
  const parts = amount.split('.')
  if (parts.length < 2 || parts.length > 2) {
    throw new Error('invalid amount given')
  }

  const tail = parts[1]
  if (tail.length > precision) {
    return 0
  }

  return tail.length
}

// Returns the given number as little endian buffer.
export function toLittleEndian(n: number): Buffer {
  const big = new Int64Buffer.Int64LE(n)
  return big.toBuffer()
}

export function toLittleEndianHex(n: number): string {
  return toLittleEndian(n).toString('hex')
}

// Returns the given number as big endian buffer.
export function toBigEndian(n: number): Buffer {
  const big = new Int64Buffer.Int64BE(n)
  return big.toBuffer()
}

export function toBigEndianHex(n: number): string {
  return toBigEndian(n).toString('hex')
}
