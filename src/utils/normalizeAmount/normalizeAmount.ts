import { Market } from '../../types'

export default function normalizeAmount(amount: string, market: Market): string {
  const precision = getPrecision(market.minTradeSize)
  return normalizeAmountForMarketPrecision(amount, precision)
}

function normalizeAmountForMarketPrecision(amount: string, tradeSize: number): string {
  const amountSplit = amount.split('.')

  if (tradeSize === 0) {
    if (amountSplit.length === 1) {
      return amountSplit[0]
    } else {
      throw new Error(`to many decimals given expected: ${tradeSize} got ${amountSplit[1].length}`)
    }
  }

  if (amountSplit.length === 1) {
    const head = amountSplit[0]
    const tail = ''.padStart(tradeSize, '0')
    return head + '.' + tail
  }

  if (amountSplit[1].length < tradeSize) {
    const head = amountSplit[0]
    const tail = ''.padStart(tradeSize - amountSplit[1].length, '0')
    return head + '.' + amountSplit[1] + tail
  }

  if (amountSplit[1].length > tradeSize) {
    return amountSplit[0] + '.' + amountSplit[1].substring(0, tradeSize)
  }

  return amount
}

const getPrecision = (exp: string): number => (+exp === 0 ? 0 : Math.abs(Math.log10(+exp)))
