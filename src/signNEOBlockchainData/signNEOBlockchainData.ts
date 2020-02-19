import { normalizeAmount, toLittleEndianHex } from '../utils/currency'
import { getUnitPairs, inferBlockchainData, getNEOAssetHash } from '../utils/blockchain'
import reverseHexString from '../utils/reverseHexString'
import { maxOrderRate, maxFeeRate, minOrderRate } from '../constants'
import { isLimitOrderPayload, kindToOrderPrefix, PayloadAndKind, BuyOrSellBuy } from '../payload'
import { BlockchainSignature, Blockchain, APIKey, PresignConfig, BIP44, Config, ChainNoncePair } from '../types'
import getNEOScriptHash from '../utils/getNEOScriptHash'
import { computePresig } from '../mpc/computePresig'
import { SmartBuffer } from 'smart-buffer'
import { wallet, u } from '@cityofzion/neon-core'
import crypto from 'crypto'

export function signNEOBlockchainData(privateKey: string, data: string): BlockchainSignature {
  const sha256 = crypto.createHash('sha256')
  const msg = sha256.update(Buffer.from(data, 'hex')).digest('hex')

  return {
    blockchain: 'NEO',
    signature: wallet.sign(msg, privateKey).toLowerCase()
  }
}

export async function presignNEOBlockchainData(
  apiKey: APIKey,
  config: PresignConfig,
  data: string
): Promise<BlockchainSignature> {
  const finalHash = u.sha256(u.sha256(data))
  const neoChildKey = apiKey.child_keys[BIP44.NEO]
  const { r, presig } = await computePresig({
    apiKey: {
      client_secret_share: neoChildKey.client_secret_share,
      paillier_pk: apiKey.paillier_pk,
      public_key: neoChildKey.public_key,
      server_secret_share_encrypted: neoChildKey.server_secret_share_encrypted
    },
    blockchain: Blockchain.NEO,
    fillPoolFn: config.fillPoolFn,
    messageHash: finalHash
  })
  return {
    blockchain: 'NEO',
    r,
    signature: presig
  }
}

export function buildNEOOrderSignatureData(
  address: string,
  publicKey: string,
  assetData: Config['assetData'],
  marketData: Config['marketData'],
  payloadAndKind: PayloadAndKind,
  chainNoncePair: ChainNoncePair
): string {
  const { kind } = payloadAndKind
  const blockchainData = inferBlockchainData(payloadAndKind)
  const { unitA, unitB } = getUnitPairs(blockchainData.marketName)

  let assetFrom = unitA
  let assetTo = unitB
  const amountPrecision = marketData[blockchainData.marketName].minTradeIncrement
  if (blockchainData.buyOrSell === BuyOrSellBuy) {
    assetFrom = unitB
    assetTo = unitA
  }

  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(kind)) // prefix
  buffer.writeString(reverseHexString(getNEOScriptHash(address)))

  buffer.writeString(getNEOAssetHash(assetData[assetFrom]))
  buffer.writeString(getNEOAssetHash(assetData[assetTo]))

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
  buffer.writeString(publicKey)

  // Already written everthing in hex, so just return the utf8 string from the
  // buffer.
  return buffer.toString('utf8').toLowerCase()
}

export function buildNEOMovementSignatureData(
  address: string,
  publicKey: string,
  assetData: Config['assetData'],
  payloadAndKind: PayloadAndKind
): string {
  const { kind } = payloadAndKind
  const { unitA } = getUnitPairs(payloadAndKind.payload.quantity.currency)

  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(kind, payloadAndKind.payload)) // prefix
  buffer.writeString(reverseHexString(getNEOScriptHash(address)))
  buffer.writeString(getNEOAssetHash(assetData[unitA]))

  const amount = normalizeAmount(payloadAndKind.payload.quantity.amount, 8)
  buffer.writeString(toLittleEndianHex(amount))

  // use the nonceOrder field when we need to sign any order payload.
  buffer.writeString(toLittleEndianHex(payloadAndKind.payload.nonce))
  buffer.writeString(publicKey)

  // Already written everthing in hex, so just return the utf8 string from the
  // buffer.
  return buffer.toString('utf8').toLowerCase()
}
