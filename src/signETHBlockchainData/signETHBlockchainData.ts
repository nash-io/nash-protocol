import { SmartBuffer } from 'smart-buffer'
import { inferBlockchainData, getUnitPairs, convertEthNonce, getETHAssetID } from '../utils/blockchain'
import { toBigEndianHex, normalizeAmount } from '../utils/currency'
import { isLimitOrderPayload, isOrderPayload, kindToOrderPrefix, PayloadAndKind, SigningPayloadID } from '../payload'
import { minOrderRate, maxOrderRate, maxFeeRate } from '../constants'
import { Config, BlockchainSignature } from '../types'
import createKeccakHash from 'keccak'
import * as EC from 'elliptic'

// only do this once
const ellipticContext = new EC.ec('secp256k1')

// Signing for Ethereum needs a little more work to be done.
// 1. Compute a KEKKAC256 hash of the data.
// 2. Prefix the resulting hash with a constant message.
// 3. Compute a KEKKAC256 hash of the prefix result.
// 4. Sign that hash with the private key.
export function signETHBlockchainData(privateKey: string, data: string): BlockchainSignature {
  const kp = ellipticContext.keyFromPrivate(privateKey)
  const initialHash = createKeccakHash('keccak256')
    .update(data, 'hex')
    .digest()

  const msgPrefix = Buffer.from('19457468657265756d205369676e6564204d6573736167653a0a3332', 'hex')
  const finalMsg = Buffer.concat([msgPrefix, initialHash])

  const finalHash = createKeccakHash('keccak256')
    .update(finalMsg)
    .digest()

  const sig = kp.sign(finalHash)
  const v = sig.recoveryParam === 0 ? '00' : '01'
  const signature = `${sig.r.toString('hex')}${sig.s.toString('hex')}${v}`

  return {
    blockchain: 'eth',
    signature
  }
}

export function buildETHBlockchainSignatureData(config: Config, payloadAndKind: PayloadAndKind): string {
  // make sure we have a ETH wallet in our config object.
  if (!('eth' in config.wallets)) {
    throw new Error('ETH wallet not found in config.wallets')
  }

  if (isOrderPayload(payloadAndKind.kind)) {
    return buildETHOrderSignatureData(config, payloadAndKind)
  } else if (payloadAndKind.kind === SigningPayloadID.addMovementPayload) {
    return buildETHMovementSignatureData(config, payloadAndKind)
  } else {
    throw new Error(`Could not sign blockchain data for payload type ${payloadAndKind}`)
  }
}

function buildETHOrderSignatureData(config: Config, payloadAndKind: PayloadAndKind): string {
  const { kind } = payloadAndKind
  const blockchainData = inferBlockchainData(payloadAndKind)
  const { unitA, unitB } = getUnitPairs(blockchainData.marketName)
  const address = config.wallets.eth.address

  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(kind))
  buffer.writeString(address)
  buffer.writeString(getETHAssetID(unitA))

  buffer.writeString(getETHAssetID(unitB))
  buffer.writeString(convertEthNonce(blockchainData.nonceTo))
  buffer.writeString(convertEthNonce(blockchainData.nonceFrom))

  // normalize + to big endian
  const precision = config.marketData[blockchainData.marketName].minTradeIncrement
  const amount = normalizeAmount(blockchainData.amount, precision)
  buffer.writeString(toBigEndianHex(amount))

  let orderRate: string = maxOrderRate

  if (isLimitOrderPayload(kind)) {
    orderRate = toBigEndianHex(
      normalizeAmount(blockchainData.limitPrice as string, config.marketData[blockchainData.marketName].minTickSize)
    )
  }

  buffer.writeString(toBigEndianHex(minOrderRate))
  buffer.writeString(orderRate)
  buffer.writeString(toBigEndianHex(maxFeeRate))

  buffer.writeString(convertEthNonce(blockchainData.nonceOrder))

  return buffer.toString('utf8').toUpperCase()
}

function buildETHMovementSignatureData(config: Config, payloadAndKind: PayloadAndKind): string {
  const { unitA } = getUnitPairs(payloadAndKind.payload.quantity.currency)
  const address = config.wallets.eth.address

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
