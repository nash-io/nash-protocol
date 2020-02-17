import { SmartBuffer } from 'smart-buffer'
import { inferBlockchainData, getUnitPairs, convertEthNonce, getETHAssetID, ellipticContext } from '../utils/blockchain'
import { toBigEndianHex, normalizeAmount } from '../utils/currency'
import { isLimitOrderPayload, kindToOrderPrefix, PayloadAndKind, BuyOrSellBuy } from '../payload'
import { computePresig } from '../mpc/computePresig'
import { minOrderRate, maxOrderRate, maxFeeRate } from '../constants'
import { Config, BIP44, APIKey, PresignConfig, BlockchainSignature, ChainNoncePair } from '../types'
import createKeccakHash from 'keccak'

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

const addLeadingZero = (str: string): string => {
  if (str.length % 2 === 0) {
    return str
  }
  return '0' + str
}

export async function presignETHBlockchainData(
  apiKey: APIKey,
  config: PresignConfig,
  data: string
): Promise<BlockchainSignature> {
  const finalHash = createHashedMessage(data).toString('hex')

  const ethChildKey = apiKey.child_keys[BIP44.ETH]
  const { r, presig } = await computePresig({
    apiKey: {
      client_secret_share: ethChildKey.client_secret_share,
      paillier_pk: apiKey.paillier_pk,
      server_secret_share_encrypted: ethChildKey.server_secret_share_encrypted
    },
    curve: 'Secp256k1',
    fillPoolFn: config.fillPoolFn,
    messageHash: finalHash
  })
  return {
    blockchain: 'ETH',
    r: addLeadingZero(r),
    signature: addLeadingZero(presig)
  }
}

export function buildETHOrderSignatureData(
  address: string,
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
  buffer.writeString(kindToOrderPrefix(kind))
  buffer.writeString(address)
  buffer.writeString(getETHAssetID(assetFrom))
  buffer.writeString(getETHAssetID(assetTo))

  buffer.writeString(convertEthNonce(chainNoncePair.nonceFrom))
  buffer.writeString(convertEthNonce(chainNoncePair.nonceTo))

  // normalize + to big endian
  const amount = normalizeAmount(blockchainData.amount, -Math.log10(amountPrecision))
  buffer.writeString(toBigEndianHex(amount))

  let orderRate: string = maxOrderRate

  if (isLimitOrderPayload(kind)) {
    orderRate = toBigEndianHex(normalizeAmount(blockchainData.limitPrice as string, 8))
  }

  buffer.writeString(toBigEndianHex(minOrderRate))
  buffer.writeString(orderRate)
  buffer.writeString(toBigEndianHex(maxFeeRate))

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
