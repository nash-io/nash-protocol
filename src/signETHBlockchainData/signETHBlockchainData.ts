import { SmartBuffer } from 'smart-buffer'
import {
  inferBlockchainData,
  getUnitPairs,
  convertEthNonce,
  getETHAssetID,
  ellipticContext,
  OrderSignatureData,
  bigNumberFormat,
  rateWithFees
} from '../utils/blockchain'
import { toBigEndianHex, normalizeAmount } from '../utils/currency'
import { isLimitOrderPayload, kindToOrderPrefix, PayloadAndKind, SigningPayloadID, BuyOrSellBuy } from '../payload'
import { computePresig } from '../mpc/computePresig'
import { BLOCKCHAIN_PRECISION, MIN_ORDER_RATE, MAX_FEE_RATE, MAX_ORDER_RATE, MAX_ORDER_AMOUNT } from '../constants'
import { Blockchain, BIP44, BlockchainSignature, APIKey, PresignConfig, ChainNoncePair } from '../types'
import createKeccakHash from 'keccak'
import BigNumber from 'bignumber.js'

const createHashedMessage = (data: string): Buffer => {
  const initialHash = createKeccakHash('keccak256')
    .update(data, 'hex')
    .digest()

  const msgPrefix = Buffer.from('19457468657265756d205369676e6564204d6573736167653a0a3332', 'hex')
  const finalMsg = Buffer.concat([msgPrefix, initialHash])

  return createKeccakHash('keccak256')
    .update(finalMsg)
    .digest()
}

// Signing for Ethereum needs a little more work to be done.
// 1. Compute a KEKKAC256 hash of the data.
// 2. Prefix the resulting hash with a constant message.
// 3. Compute a KEKKAC256 hash of the prefix result.
// 4. Sign that hash with the private key.
export function signETHBlockchainData(privateKey: string, data: string): BlockchainSignature {
  const kp = ellipticContext.keyFromPrivate(privateKey)
  const finalHash = createHashedMessage(data)
  const sig = kp.sign(finalHash)
  const v = sig.recoveryParam === 0 ? '00' : '01'
  const r = sig.r.toString('hex', 64)
  const s = sig.s.toString('hex', 64)
  const signature: string = `${r}${s}${v}`

  return {
    blockchain: 'ETH',
    signature: signature.toLowerCase()
  }
}

export async function presignETHBlockchainData(
  apiKey: APIKey,
  config: PresignConfig,
  data: string,
  performHash: boolean = true
): Promise<BlockchainSignature> {
  let finalHash
  if (performHash) {
    finalHash = createHashedMessage(data).toString('hex')
  } else {
    finalHash = data
  }
  const ethChildKey = apiKey.child_keys[BIP44.ETH]
  const { r, presig } = await computePresig({
    apiKey: {
      client_secret_share: ethChildKey.client_secret_share,
      paillier_pk: apiKey.paillier_pk,
      public_key: ethChildKey.public_key,
      server_secret_share_encrypted: ethChildKey.server_secret_share_encrypted
    },
    blockchain: Blockchain.ETH,
    fillPoolFn: config.fillPoolFn,
    messageHash: finalHash
  })
  return {
    blockchain: 'ETH',
    r,
    signature: presig
  }
}

export function buildETHOrderSignatureData(
  address: string,
  payloadAndKind: PayloadAndKind,
  chainNoncePair: ChainNoncePair,
  orderData: OrderSignatureData
): string {
  const { kind } = payloadAndKind
  const blockchainData = inferBlockchainData(payloadAndKind)

  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(kind))
  buffer.writeString(address)
  buffer.writeString(getETHAssetID(orderData.source.symbol))
  buffer.writeString(getETHAssetID(orderData.destination.symbol))
  buffer.writeString(convertEthNonce(chainNoncePair.nonceFrom))
  buffer.writeString(convertEthNonce(chainNoncePair.nonceTo))

  // market buy orders are not supported, but if they were we would set the amount to max value
  if (payloadAndKind.kind === SigningPayloadID.placeMarketOrderPayload && blockchainData.buyOrSell === BuyOrSellBuy) {
    buffer.writeString(MAX_ORDER_AMOUNT)
  } else {
    const amount = normalizeAmount(orderData.source.amount, BLOCKCHAIN_PRECISION)
    buffer.writeString(toBigEndianHex(amount))
  }

  let orderRate: number = MIN_ORDER_RATE
  if (isLimitOrderPayload(kind)) {
    const rate = rateWithFees(orderData.rate)
    orderRate = normalizeAmount(rate.toFormat(8, BigNumber.ROUND_DOWN, bigNumberFormat), BLOCKCHAIN_PRECISION)
  }

  buffer.writeString(toBigEndianHex(orderRate))
  buffer.writeString(MAX_ORDER_RATE)
  buffer.writeString(toBigEndianHex(MAX_FEE_RATE))

  buffer.writeString(convertEthNonce(blockchainData.nonceOrder))

  return buffer.toString('utf8').toUpperCase()
}

export function buildETHMovementSignatureData(address: string, payloadAndKind: PayloadAndKind): string {
  const { unitA } = getUnitPairs(payloadAndKind.payload.quantity.currency)

  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(payloadAndKind.kind, payloadAndKind.payload)) // prefix
  buffer.writeString(address)
  buffer.writeString(getETHAssetID(unitA))

  // normalize + to big endian
  const amount = normalizeAmount(payloadAndKind.payload.quantity.amount, 8)
  buffer.writeString(toBigEndianHex(amount))

  buffer.writeString(convertEthNonce(payloadAndKind.payload.nonce))

  buffer.writeString(address)
  return buffer.toString('utf8').toUpperCase()
}
