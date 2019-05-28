import { SmartBuffer } from 'smart-buffer'

import { inferBlockchainData, getUnitPairs, getETHAssetID, reverseHexString } from './helpers'
import { toBigEndianHex } from '../utils/currency'
import { normalizeAmount } from '../utils/normalizeAmount'
import { isLimitOrderPayload, isOrderPayload, kindToOrderPrefix, PayloadAndKind } from '../payload'
import { minOrderRate, maxOrderRate, maxFeeRate } from './constants'
import { Config, BlockchainSignature } from '../types'

export function signETHBlockchainData(privateKey: string, payload: any): BlockchainSignature {
  console.log(privateKey)
  console.log(payload)
  return {
    blockchain: 'eth',
    signature: ''
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

  const amount = normalizeAmount(blockchainData.amount, config.marketData[blockchainData.marketName])
  buffer.writeString(toBigEndianHex(Number(amount)))

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
