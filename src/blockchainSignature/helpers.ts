import { PayloadAndKind, SigningPayloadID } from '../payload'
import { BlockchainData } from '../types'

export function getETHAssetID(asset: string): string {
  switch (asset) {
    case 'eth':
      return '0000'
    case 'bat':
      return '0001'
    case 'omg':
      return '0002'
    case 'usdc':
      return '0003'
    case 'bnb':
      return '0004'
    default:
      return 'ffff'
  }
}

export function reverseHexString(hex: string): string {
  const rev = hex.match(/[a-fA-F0-9]{2}/g)
  if (!rev) {
    throw new Error('invalid hex string given')
  }
  return rev.reverse().join('')
}

// infers the blockchain specific data we need for the given payload. Some payloads
// have different fields, hence need different approach to retrieve the data we need.
export function inferBlockchainData(payloadAndKind: PayloadAndKind): BlockchainData {
  const { payload, kind } = payloadAndKind

  switch (kind) {
    case SigningPayloadID.placeMarketOrderPayload:
    case SigningPayloadID.placeStopMarketOrderPayload:
    case SigningPayloadID.placeLimitOrderPayload:
    case SigningPayloadID.placeStopLimitOrderPayload:
      return {
        amount: payload.amount.amount,
        marketName: payload.marketName,
        nonce: payload.nonce,
        nonceFrom: payload.nonceFrom,
        nonceOrder: payload.nonceOrder,
        nonceTo: payload.nonceTo
      }
    default:
      throw new Error('invalid kind')
  }
}

export function getUnitPairs(market: string): any {
  const pairs = market.split('_')
  return {
    unitA: pairs[0],
    unitB: pairs[1]
  }
}
