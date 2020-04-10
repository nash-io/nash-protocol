import { PayloadAndKind, SigningPayloadID, kindToOrderPrefix, isLimitOrderPayload, BuyOrSellSell } from '../../payload'
import { Config, BlockchainData, BlockchainMovement, Asset } from '../../types'
import getNEOScriptHash from '../getNEOScriptHash'
import { normalizeAmount, toLittleEndianHex } from '../currency'
import reverseHexString from '../reverseHexString'
import BigNumber from 'bignumber.js'
import * as EC from 'elliptic'

// only do this once
export const ellipticContext = new EC.ec('secp256k1')

const BN = BigNumber.clone({ DECIMAL_PLACES: 16, ROUNDING_MODE: BigNumber.ROUND_FLOOR })

const bigNumberFormat = {
  decimalSeparator: '.',
  groupSeparator: '',
  groupSize: 50,
  prefix: ''
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
      let limitPrice: string = ''

      if (isLimitOrderPayload(kind)) {
        limitPrice = getLimitPrice(payload.marketName, payload.buyOrSell, payload.limitPrice)
      }

      return {
        amount: payload.amount.amount,
        buyOrSell: payload.buyOrSell,
        limitPrice,
        marketName: payload.marketName,
        nonce: payload.nonce,
        nonceOrder: payload.nonceOrder,
        noncesFrom: payload.noncesFrom,
        noncesTo: payload.noncesTo
      }

    default:
      throw new Error('invalid kind')
  }
}

export function getBlockchainMovement(
  wallets: {
    eth: {
      publicKey: string
      address: string
    }
    neo: {
      publicKey: string
      address: string
    }
    btc: {
      publicKey: string
      address: string
    }
  },
  assets: Config['assetData'],
  payloadAndKind: PayloadAndKind
): BlockchainMovement {
  const { payload, kind } = payloadAndKind
  const unit = payload.quantity.currency
  const prefix = kindToOrderPrefix(kind, payload)
  const bnAmount: BigNumber = new BigNumber(normalizeAmount(payload.quantity.amount, 8))

  switch (assets[unit].blockchain) {
    case 'neo':
      const scriptHash = getNEOScriptHash(wallets.neo.address)
      return {
        address: reverseHexString(scriptHash),
        amount: toLittleEndianHex(normalizeAmount(payload.quantity.amount, 8)),
        asset: getNEOAssetHash(assets[unit]),
        nonce: toLittleEndianHex(payload.nonce),
        prefix,
        r: payload.blockchainSignatures[0].r,
        userPubKey: wallets.neo.publicKey,
        userSig: payload.blockchainSignatures[0].signature
      }
    case 'eth':
      return {
        address: wallets.eth.address,
        amount: bnAmount.toFixed(0),
        asset: getETHAssetID(unit),
        nonce: convertEthNonce(payload.nonce),
        prefix,
        r: payload.blockchainSignatures[0].r,
        userPubKey: wallets.eth.address,
        userSig: payload.blockchainSignatures[0].signature
      }
    case 'btc':
      return {
        address: wallets.btc.address,
        amount: bnAmount.toFixed(0),
        asset: '00',
        nonce: convertEthNonce(payload.nonce),
        prefix,
        userPubKey: wallets.btc.address,
        userSig: ''
      }
    default:
      throw new Error(`invalid blockchain: ${assets[unit].blockchain}`)
  }
}

export function getLimitPrice(marketName: string, buyOrSell: string, limitPrice: any): string {
  const { unitA, unitB } = getUnitPairs(marketName)
  let assetFrom = unitB
  if (buyOrSell === BuyOrSellSell) {
    assetFrom = unitA
  }
  if (limitPrice.currency_a === assetFrom) {
    return limitPrice.amount
  } else if (limitPrice.currency_b === assetFrom) {
    const amount = new BN(limitPrice.amount)
    const reciprocal = new BN(1).div(amount)
    return reciprocal.toFormat(8, bigNumberFormat)
  }

  throw Error(
    `Could not determine limit price for market: ${marketName} with direction ${buyOrSell} and limit price ${JSON.stringify(
      limitPrice
    )}`
  )
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
    case 'zrx':
      return '0004'
    case 'link':
      return '0005'
    case 'qnt':
      return '0006'
    case 'rlc':
      return '000a'
    default:
      return 'ffff'
  }
}
