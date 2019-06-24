import { PayloadAndKind, SigningPayloadID, kindToOrderPrefix } from '../../payload'
import { Config, BlockchainData, BlockchainMovement } from '../../types'
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

export function getBlockchainMovement(config: Config, payloadAndKind: PayloadAndKind): BlockchainMovement {
  const blockchainData = inferBlockchainData(payloadAndKind)
  const assets = config.assetData
  const { unitA } = getUnitPairs(blockchainData.marketName)

  switch (assets[unitA].blockchain) {
    case 'neo':
      const scriptHash = getNEOScriptHash(config.wallets.neo.address)
      return {
        address: Buffer.from(scriptHash).toString('hex'),
        amount: String(normalizeAmount(blockchainData.amount, 8)),
        asset: reverseHexString(assets[unitA].hash),
        nonce: toLittleEndianHex(blockchainData.nonce),
        prefix: kindToOrderPrefix(payloadAndKind.kind),
        userPubKey: config.wallets.neo.publicKey
      }
    case 'eth':
      const chainPrecision = config.assetData.eth.precision
      return {
        address: config.wallets.eth.address,
        amount: String(normalizeAmount(blockchainData.amount, chainPrecision)),
        asset: getETHAssetID(unitA),
        nonce: '00000000', // TODO: convertETHNonce
        prefix: kindToOrderPrefix(payloadAndKind.kind),
        userPubKey: config.wallets.eth.address
      }
    default:
      throw new Error(`invalid blockchain: ${assets[unitA].blockchain}`)
  }
}

export function getUnitPairs(market: string): any {
  const pairs = market.split('_')
  return {
    unitA: pairs[0],
    unitB: pairs[1]
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
