import { normalizeAmount, toLittleEndianHex } from '../utils/currency'
import { getUnitPairs, inferBlockchainData, getNEOAssetHash } from '../utils/blockchain'
import reverseHexString from '../utils/reverseHexString'
import { maxOrderRate, maxFeeRate, minOrderRate } from '../constants'
import { isLimitOrderPayload, isOrderPayload, kindToOrderPrefix, PayloadAndKind } from '../payload'
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

  const { kind } = payloadAndKind
  const blockchainData = inferBlockchainData(payloadAndKind)
  const { unitA, unitB } = getUnitPairs(blockchainData.marketName)

  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(kind)) // prefix
  buffer.writeString(reverseHexString(getNEOScriptHash(config.wallets.neo.address)))
  buffer.writeString(getNEOAssetHash(config.assetData[unitA]))
  // only orders have a destination market.
  if (isOrderPayload(kind)) {
    buffer.writeString(getNEOAssetHash(config.assetData[unitB]))
    buffer.writeString(toLittleEndianHex(blockchainData.nonceTo))
    buffer.writeString(toLittleEndianHex(blockchainData.nonceFrom))
  }

  const precision = config.marketData[blockchainData.marketName].minTradeIncrement
  const amount = normalizeAmount(blockchainData.amount, precision)
  buffer.writeString(toLittleEndianHex(amount))

  // only write the fee's when the it's an order.
  if (isOrderPayload(kind)) {
    // NOTE: limit orders price needs normalization.
    if (isLimitOrderPayload(kind)) {
      // TODO: normalization on the price of the limit order.
      buffer.writeString(toLittleEndianHex(minOrderRate))
      buffer.writeString(maxOrderRate)
      buffer.writeString(toLittleEndianHex(maxFeeRate))
    }

    // TODO: need normalization whith precicions
    buffer.writeString(toLittleEndianHex(minOrderRate))
    buffer.writeString(maxOrderRate)
    buffer.writeString(toLittleEndianHex(maxFeeRate))
  }

  // use the nonceOrder field when we need to sign any order payload.
  if (isOrderPayload(kind)) {
    buffer.writeString(toLittleEndianHex(blockchainData.nonceOrder))
  } else {
    buffer.writeString(toLittleEndianHex(blockchainData.nonce))
  }
  buffer.writeString(config.wallets.neo.publicKey)

  // Already written everthing in hex, so just return the utf8 string from the
  // buffer.
  return buffer.toString('utf8').toLowerCase()
}
