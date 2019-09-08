import { normalizeAmount, toLittleEndianHex } from '../utils/currency'
import { getUnitPairs, inferBlockchainData, getNEOAssetHash } from '../utils/blockchain'
import reverseHexString from '../utils/reverseHexString'
import { maxOrderRate, maxFeeRate, minOrderRate } from '../constants'
import { isLimitOrderPayload, kindToOrderPrefix, PayloadAndKind, BuyOrSellBuy } from '../payload'
import { BlockchainSignature, Config, ChainNoncePair } from '../types'
import getNEOScriptHash from '../utils/getNEOScriptHash'
import { SmartBuffer } from 'smart-buffer'
import { wallet } from '@cityofzion/neon-core'
import crypto from 'crypto'

export function signNEOBlockchainData(privateKey: string, data: string): BlockchainSignature {
  const sha256 = crypto.createHash('sha256')
  const msg = sha256.update(Buffer.from(data, 'hex')).digest('hex')

  return {
    blockchain: 'NEO',
    signature: wallet.sign(msg, privateKey).toLowerCase()
  }
}

export function buildNEOOrderSignatureData(
  config: Config,
  payloadAndKind: PayloadAndKind,
  chainNoncePair: ChainNoncePair
): string {
  const { kind } = payloadAndKind
  const blockchainData = inferBlockchainData(payloadAndKind)
  const { unitA, unitB } = getUnitPairs(blockchainData.marketName)

  let assetFrom = unitA
  let assetTo = unitB
  let amountPrecision = config.marketData[blockchainData.marketName].minTradeIncrementB
  if (blockchainData.buyOrSell === BuyOrSellBuy) {
    assetFrom = unitB
    assetTo = unitA
    amountPrecision = config.marketData[blockchainData.marketName].minTradeIncrementA
  }

  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(kind)) // prefix
  buffer.writeString(reverseHexString(getNEOScriptHash(config.wallets.neo.address)))

  buffer.writeString(getNEOAssetHash(config.assetData[assetFrom]))
  buffer.writeString(getNEOAssetHash(config.assetData[assetTo]))

  buffer.writeString(toLittleEndianHex(chainNoncePair.nonceFrom))
  buffer.writeString(toLittleEndianHex(chainNoncePair.nonceTo))

  const amount = normalizeAmount(blockchainData.amount, amountPrecision)
  buffer.writeString(toLittleEndianHex(amount))

  let orderRate: string = maxOrderRate
  if (isLimitOrderPayload(kind)) {
    orderRate = toLittleEndianHex(normalizeAmount(blockchainData.limitPrice as string, 8))
  }

  buffer.writeString(toLittleEndianHex(minOrderRate))
  buffer.writeString(orderRate)
  buffer.writeString(toLittleEndianHex(maxFeeRate))

  // use the nonceOrder field when we need to sign any order payload.
  buffer.writeString(toLittleEndianHex(blockchainData.nonceOrder))
  buffer.writeString(config.wallets.neo.publicKey)

  // Already written everthing in hex, so just return the utf8 string from the
  // buffer.
  return buffer.toString('utf8').toLowerCase()
}

export function buildNEOMovementSignatureData(config: Config, payloadAndKind: PayloadAndKind): string {
  const { kind } = payloadAndKind
  const { unitA } = getUnitPairs(payloadAndKind.payload.quantity.currency)

  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(kind, payloadAndKind.payload)) // prefix
  buffer.writeString(reverseHexString(getNEOScriptHash(config.wallets.neo.address)))
  buffer.writeString(getNEOAssetHash(config.assetData[unitA]))

  const amount = normalizeAmount(payloadAndKind.payload.quantity.amount, 8)
  buffer.writeString(toLittleEndianHex(amount))

  // use the nonceOrder field when we need to sign any order payload.
  buffer.writeString(toLittleEndianHex(payloadAndKind.payload.nonce))
  buffer.writeString(config.wallets.neo.publicKey)

  // Already written everthing in hex, so just return the utf8 string from the
  // buffer.
  return buffer.toString('utf8').toLowerCase()
}
