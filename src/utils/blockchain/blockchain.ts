import { PayloadAndKind, SigningPayloadID, kindToOrderPrefix, isLimitOrderPayload } from '../../payload'
import { Config, BlockchainData, BlockchainMovement, Asset } from '../../types'
import getNEOScriptHash from '../getNEOScriptHash'
import { normalizeAmount, toLittleEndianHex } from '../currency'
import reverseHexString from '../reverseHexString'

// infers the blockchain specific data we need for the given payload. Some payloads
// have different fields, hence need different approach to retrieve the data we need.
export function inferBlockchainData(payloadAndKind: PayloadAndKind): BlockchainData {
  const { payload, kind } = payloadAndKind

  switch (kind) {
    case SigningPayloadID.placeMarketOrderPayload:
    case SigningPayloadID.placeStopMarketOrderPayload:
    case SigningPayloadID.placeLimitOrderPayload:
    case SigningPayloadID.placeStopLimitOrderPayload:
      let limitPrice: string = ''

      if (isLimitOrderPayload(kind)) {
        limitPrice = payload.limitPrice.amount
      }

      return {
        amount: payload.amount.amount,
        limitPrice,
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

export function getBlockchainMovement(config: Config, payloadAndKind: PayloadAndKind): BlockchainMovement {
  const assets = config.assetData
  const { payload, kind } = payloadAndKind
  const unit = payload.quantity.currency
  const prefix = kindToOrderPrefix(kind, payload)

  switch (assets[unit].blockchain) {
    case 'neo':
      const scriptHash = getNEOScriptHash(config.wallets.neo.address)
      return {
        address: reverseHexString(scriptHash),
        amount: String(normalizeAmount(payload.quantity.amount, 8)),
        asset: getNEOAssetHash(assets[unit]),
        nonce: toLittleEndianHex(payload.nonce),
        prefix,
        userPubKey: config.wallets.neo.publicKey,
        userSig: payload.blockchainSignatures[0].signature.toUpperCase()
      }
    case 'eth':
      return {
        address: config.wallets.eth.address,
        amount: String(normalizeAmount(payload.quantity.amount, 18)),
        asset: getETHAssetID(unit),
        nonce: convertEthNonce(payload.nonce),
        prefix,
        userPubKey: config.wallets.eth.address,
        userSig: payload.blockchainSignatures[0].signature.toUpperCase()
      }
    default:
      throw new Error(`invalid blockchain: ${assets[unit].blockchain}`)
  }
}

export function getUnitPairs(market: string): any {
  const pairs = market.split('_')
  switch (pairs.length) {
    case 1:
      return { unitA: pairs[0] }
    case 2:
      return {
        unitA: pairs[0],
        unitB: pairs[1]
      }
    default:
      throw new Error(`Cannot get market pairs for ${market}`)
  }
}

export function convertEthNonce(nonce: number): string {
  const out = nonce.toString(16)
  if (out.length > 8) {
    throw Error('Nonce too large for uint32')
  }
  return out.padStart(8, '0')
}

export function getNEOAssetHash(asset: Asset): string {
  switch (asset.blockchain) {
    case 'neo':
      return reverseHexString(asset.hash)
    default:
      return 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
  }
}

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
