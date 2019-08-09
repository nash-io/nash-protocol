import { normalizeAmount, toLittleEndianHex } from '../utils/currency'
import { getUnitPairs, inferBlockchainData, getNEOAssetHash } from '../utils/blockchain'
import reverseHexString from '../utils/reverseHexString'
import { maxOrderRate, maxFeeRate, minOrderRate } from '../constants'
import { isLimitOrderPayload, isOrderPayload, kindToOrderPrefix, PayloadAndKind, SigningPayloadID } from '../payload'
import { BlockchainSignature, Config } from '../types'
import getNEOScriptHash from '../utils/getNEOScriptHash'
import { SmartBuffer } from 'smart-buffer'
import { wallet } from '@cityofzion/neon-core'
import crypto from 'crypto'

export function signNEOBlockchainData(privateKey: string, data: string): BlockchainSignature {
  const sha256 = crypto.createHash('sha256')
  const msg = sha256.update(Buffer.from(data, 'hex')).digest('hex')

  return {
    blockchain: 'neo',
    signature: wallet.sign(msg, privateKey)
  }
}

export function buildNEOBlockchainSignatureData(config: Config, payloadAndKind: PayloadAndKind): string {
  // make sure we have a NEO wallet in our config object.
  if (!('neo' in config.wallets)) {
    throw new Error('NEO wallet not found in config.wallets')
  }

  if (isOrderPayload(payloadAndKind.kind)) {
    return buildNEOOrderSignatureData(config, payloadAndKind)
  } else if (payloadAndKind.kind === SigningPayloadID.addMovementPayload) {
    return buildNEOMovementSignatureData(config, payloadAndKind)
  } else {
    throw new Error(`Could not sign blockchain data for payload type ${payloadAndKind}`)
  }
}

function buildNEOOrderSignatureData(config: Config, payloadAndKind: PayloadAndKind): string {
  const { kind } = payloadAndKind
  const blockchainData = inferBlockchainData(payloadAndKind)
  const { unitA, unitB } = getUnitPairs(blockchainData.marketName)

  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(kind)) // prefix
  buffer.writeString(reverseHexString(getNEOScriptHash(config.wallets.neo.address)))
  buffer.writeString(getNEOAssetHash(config.assetData[unitA]))

  buffer.writeString(getNEOAssetHash(config.assetData[unitB]))
  buffer.writeString(toLittleEndianHex(blockchainData.nonceTo))
  buffer.writeString(toLittleEndianHex(blockchainData.nonceFrom))

  const precision = config.marketData[blockchainData.marketName].minTradeIncrement
  const amount = normalizeAmount(blockchainData.amount, precision)
  buffer.writeString(toLittleEndianHex(amount))

  let orderRate: string = maxOrderRate
  if (isLimitOrderPayload(kind)) {
    orderRate = toLittleEndianHex(
      normalizeAmount(blockchainData.limitPrice as string, config.marketData[blockchainData.marketName].minTickSize)
    )
  }
  // TODO: need normalization whith precicions
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

function buildNEOMovementSignatureData(config: Config, payloadAndKind: PayloadAndKind): string {
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
