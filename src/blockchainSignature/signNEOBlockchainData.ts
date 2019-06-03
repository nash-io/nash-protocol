import { SmartBuffer } from 'smart-buffer'
import { ec as EC } from 'elliptic'

import { inferBlockchainData, getUnitPairs, reverseHexString } from './helpers'
import { toLittleEndianHex, normalizeAmount } from '../utils/currency'
import { isLimitOrderPayload, isOrderPayload, kindToOrderPrefix, PayloadAndKind } from '../payload'
import { minOrderRate, maxOrderRate, maxFeeRate } from './constants'
import { Config, BlockchainSignature } from '../types'

import getNEOScriptHash from '../utils/getNEOScriptHash'

const curve = new EC('secp256k1')

export function signNEOBlockchainData(privateKey: string, data: string): BlockchainSignature {
  const keypair = curve.keyFromPrivate(privateKey)

  return {
    blockchain: 'neo',
    signature: keypair.sign(data).toDER()
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
  buffer.writeString(reverseHexString(config.assetData[unitA].hash))

  // only orders have a destination market.
  if (isOrderPayload(kind)) {
    buffer.writeString(reverseHexString(config.assetData[unitB].hash))
    buffer.writeString(toLittleEndianHex(blockchainData.nonceTo))
    buffer.writeString(toLittleEndianHex(blockchainData.nonceFrom))
  }

  const precision = config.marketData[blockchainData.marketName].minTradeSize
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
