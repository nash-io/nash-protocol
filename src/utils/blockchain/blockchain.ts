import {
  PayloadAndKind,
  SigningPayloadID,
  kindToOrderPrefix,
  BuyOrSellSell,
  BuyOrSellBuy,
  isLimitOrderPayload
} from '../../payload'
import { Config, BlockchainData, BlockchainMovement, Asset } from '../../types'
import getNEOScriptHash from '../getNEOScriptHash'
import { normalizeAmount, toLittleEndianHex } from '../currency'
import reverseHexString from '../reverseHexString'
import BigNumber from 'bignumber.js'
import * as EC from 'elliptic'

// only do this once
export const ellipticContext = new EC.ec('secp256k1')

export const BN = BigNumber.clone({ DECIMAL_PLACES: 16 })

export const bigNumberFormat = {
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
      let limitPrice: BigNumber = new BigNumber(0)
      const amountFlipped = isAmountFlipped(payload.marketName, payload.amount)
      if (isLimitOrderPayload(kind)) {
        limitPrice = getLimitPrice(payload.marketName, payload.buyOrSell, payload.limitPrice, amountFlipped)
      }
      return {
        amount: payload.amount.amount,
        amountFlipped,
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

export interface AssetAmount {
  amount: string
  asset: Asset
  symbol: string
}

export interface OrderSignatureData {
  destination: AssetAmount
  meAmount: string
  meRate: string
  precision: number
  rate: BigNumber
  source: AssetAmount
}

export function buildOrderSignatureData(
  marketData: Config['marketData'],
  assetData: Config['assetData'],
  payloadAndKind: PayloadAndKind
): OrderSignatureData {
  const blockchainData = inferBlockchainData(payloadAndKind)
  const { unitA, unitB } = getUnitPairsFlipped(blockchainData.marketName, blockchainData.amountFlipped)
  const amountPrecision = marketData[blockchainData.marketName].minTradeIncrement
  const assetA = assetData[unitA]
  const assetB = assetData[unitB]

  // Amount of order always in asset A in ME
  const amountOfA = blockchainData.amount
  // Price is always in terms of asset B in ME
  const bPerA = blockchainData.limitPrice
  const aPerB = invertPrice(blockchainData.limitPrice)
  const amountOfB = exchangeAmount(bPerA, amountOfA)

  switch (blockchainData.buyOrSell) {
    case BuyOrSellBuy:
      return {
        destination: {
          amount: amountOfA,
          asset: assetA,
          symbol: unitA
        },
        meAmount: amountOfA,
        meRate: bPerA.toFormat(bigNumberFormat),
        precision: amountPrecision,
        rate: aPerB,
        source: {
          amount: amountOfB,
          asset: assetB,
          symbol: unitB
        }
      }
    case BuyOrSellSell:
      return {
        destination: {
          amount: amountOfB,
          asset: assetB,
          symbol: unitB
        },
        meAmount: amountOfA,
        meRate: bPerA.toFormat(bigNumberFormat),
        precision: amountPrecision,
        rate: bPerA,
        source: {
          amount: amountOfA,
          asset: assetA,
          symbol: unitA
        }
      }
    default:
      throw new Error('Invalid order side')
  }
}

export function invertPrice(amount: BigNumber): BigNumber {
  return new BN(1).div(amount)
}

export function exchangeAmount(price: BigNumber, amount: string): string {
  const total = new BigNumber(amount).times(price)
  return total.toFormat(8, bigNumberFormat)
}

export function rateWithFees(rate: BigNumber): BigNumber {
  return rate.times(399).div(400)
}

export function isAmountFlipped(marketName: string, amount: any): boolean {
  const { unitB } = getUnitPairs(marketName)
  return unitB === amount.currency.toLowerCase()
}

export function getLimitPrice(
  marketName: string,
  buyOrSell: string,
  limitPrice: any,
  amountFlipped: boolean
): BigNumber {
  const { unitA, unitB } = getUnitPairs(marketName)
  let assetFrom = unitB
  if (amountFlipped) {
    assetFrom = unitA
  }

  if (limitPrice.currency_a === assetFrom) {
    return new BigNumber(limitPrice.amount)
  } else if (limitPrice.currency_b === assetFrom) {
    const amount = new BN(limitPrice.amount)
    return new BN(1).div(amount)
  }

  throw Error(
    `Could not determine limit price for market: ${marketName} with direction ${buyOrSell} and limit price ${JSON.stringify(
      limitPrice
    )}`
  )
}

export function getUnitPairsFlipped(market: string, flip: boolean): any {
  const { unitA, unitB } = getUnitPairs(market)
  if (flip) {
    return { unitA: unitB, unitB: unitA }
  }
  return { unitA, unitB }
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
    case 'ant':
      return '000e'
    case 'usdt':
      return '0011'
    case 'erd':
      return '0013'
    case 'trac':
      return '0014'
    case 'gunthy':
      return '0015'
    case 'noia':
      return '0019'
    default:
      return 'ffff'
  }
}
