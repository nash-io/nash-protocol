import { ec as EC } from 'elliptic'
import { SmartBuffer } from 'smart-buffer'
import crypto from 'crypto'

import { normalizeAmount, toLittleEndianHex } from '../utils/currency'
import {
  getUnitPairs,
  inferBlockchainData,
  getNEOAssetHash,
  OrderSignatureData,
  bigNumberFormat,
  rateWithFees
} from '../utils/blockchain'
import reverseHexString from '../utils/reverseHexString'
import { BLOCKCHAIN_PRECISION, MIN_ORDER_RATE, MAX_FEE_RATE, MAX_ORDER_RATE, MAX_ORDER_AMOUNT } from '../constants'
import { isLimitOrderPayload, kindToOrderPrefix, PayloadAndKind, SigningPayloadID, BuyOrSellBuy } from '../payload'
import { BlockchainSignature, Blockchain, APIKey, PresignConfig, BIP44, Config, ChainNoncePair } from '../types'
import getNEOScriptHash from '../utils/getNEOScriptHash'
import { computePresig } from '../mpc/computePresig'
import { BigNumber } from 'bignumber.js'

const curve = new EC('p256')
const sha256 = (msg: string): string => {
  const sha256H = crypto.createHash('sha256')
  return sha256H.update(Buffer.from(msg, 'hex')).digest('hex')
}

export function signNEOBlockchainData(privateKey: string, data: string): BlockchainSignature {
  const msgHash = sha256(sha256(data))
  const msgHashHex = Buffer.from(msgHash, 'hex')
  const privateKeyBuffer = Buffer.from(privateKey, 'hex')
  const sig = curve.sign(msgHashHex, privateKeyBuffer)

  return {
    blockchain: 'NEO',
    signature: sig.r.toString('hex', 32) + sig.s.toString('hex', 32)
  }
}

export async function presignNEOBlockchainData(
  apiKey: APIKey,
  config: PresignConfig,
  data: string
): Promise<BlockchainSignature> {
  const finalHash = sha256(sha256(data))
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
  payloadAndKind: PayloadAndKind,
  chainNoncePair: ChainNoncePair,
  orderData: OrderSignatureData
): string {
  const { kind } = payloadAndKind
  const blockchainData = inferBlockchainData(payloadAndKind)

  //  let minOrderRate = orderData.rate
  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(kind)) // prefix
  buffer.writeString(reverseHexString(getNEOScriptHash(address)))

  buffer.writeString(getNEOAssetHash(orderData.source.asset))
  buffer.writeString(getNEOAssetHash(orderData.destination.asset))

  buffer.writeString(toLittleEndianHex(chainNoncePair.nonceFrom))
  buffer.writeString(toLittleEndianHex(chainNoncePair.nonceTo))

  // market buy orders are not supported, but if they were we would set the amount to max value
  if (payloadAndKind.kind === SigningPayloadID.placeMarketOrderPayload && blockchainData.buyOrSell === BuyOrSellBuy) {
    buffer.writeString(MAX_ORDER_AMOUNT)
  } else {
    const amount = normalizeAmount(orderData.source.amount, BLOCKCHAIN_PRECISION)
    buffer.writeString(toLittleEndianHex(amount))
  }

  let orderRate: number = MIN_ORDER_RATE
  if (isLimitOrderPayload(kind)) {
    const rate = rateWithFees(orderData.rate)
    orderRate = normalizeAmount(rate.toFormat(8, BigNumber.ROUND_DOWN, bigNumberFormat), BLOCKCHAIN_PRECISION)
  }

  buffer.writeString(toLittleEndianHex(orderRate))
  buffer.writeString(MAX_ORDER_RATE)
  buffer.writeString(toLittleEndianHex(MAX_FEE_RATE))

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
