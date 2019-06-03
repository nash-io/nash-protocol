import { SmartBuffer } from 'smart-buffer'
import { ec as EC } from 'elliptic'

import { inferBlockchainData, getUnitPairs, getETHAssetID, reverseHexString } from './helpers'
import { toBigEndianHex, normalizeAmount } from '../utils/currency'
import { isLimitOrderPayload, isOrderPayload, kindToOrderPrefix, PayloadAndKind } from '../payload'
import { minOrderRate, maxOrderRate, maxFeeRate } from './constants'
import { Config, BlockchainSignature } from '../types'

const curve = new EC('secp256k1')

export function signETHBlockchainData(privateKey: string, data: string): BlockchainSignature {
  const keypair = curve.keyFromPrivate(privateKey)

  return {
    blockchain: 'eth',
    signature: keypair.sign(data).toDER()
  }
}

export function buildETHBlockchainSignatureData(config: Config, payloadAndKind: PayloadAndKind): string {
  // make sure we have a NEO wallet in our config object.
  if (!('eth' in config.wallets)) {
    throw new Error('NEO wallet not found in config.wallets')
  }
  const { kind } = payloadAndKind
  const blockchainData = inferBlockchainData(payloadAndKind)
  const { unitA, unitB } = getUnitPairs(blockchainData.marketName)
  const address = config.wallets.eth.address

  const buffer = new SmartBuffer()
  buffer.writeString(kindToOrderPrefix(kind))
  buffer.writeString(address)
  buffer.writeString(reverseHexString(getETHAssetID(unitA)))

  if (isOrderPayload(kind)) {
    buffer.writeString(getETHAssetID(unitB))

    // TOOD: Write nonces in the 4 byte ETH format.
    buffer.writeString('00000000')
    buffer.writeString('00000000')
  }

  // normalize + to big endian
  const precision = config.marketData[blockchainData.marketName].minTradeSize
  const amount = normalizeAmount(blockchainData.amount, precision)
  buffer.writeString(toBigEndianHex(amount))

  if (isOrderPayload(kind)) {
    if (isLimitOrderPayload(kind)) {
      buffer.writeString(toBigEndianHex(minOrderRate))
      buffer.writeString(maxOrderRate)
      buffer.writeString(toBigEndianHex(maxFeeRate))
    }
    buffer.writeString(toBigEndianHex(minOrderRate))
    buffer.writeString(maxOrderRate)
    buffer.writeString(toBigEndianHex(maxFeeRate))
  }

  if (isOrderPayload(kind)) {
    // also, the nonce needs to be the order nonce
    // convertEthNonce
    // buffer.writeString(toLittleEndian(blockchainData.nonceOrder))
    buffer.writeString('00000000')
  } else {
    // covertEthNonce
    // buffer.writeString(toLittleEndian(blockchainData.nonce))
    buffer.writeString('00000000')
  }

  if (!isOrderPayload(kind)) {
    buffer.writeString(address)
  }

  return buffer.toString('utf8').toUpperCase()
}
