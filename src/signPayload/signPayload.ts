import hexEncoding from 'crypto-js/enc-hex'
import SHA256 from 'crypto-js/sha256'
import _ from 'lodash'
import { ec as EC } from 'elliptic'
import compose from 'lodash/fp/compose'
import mapKeys from 'lodash/fp/mapKeys'
import snakeCase from 'lodash/fp/snakeCase'
import toLower from 'lodash/fp/toLower'

import bufferize from '../bufferize'
import stringify from '../stringify'
import deep from '../utils/deep'

import { kindToName, needBlockchainMovement, needBlockchainSignature } from '../payload/signingPayloadID'
import { Config, PayloadSignature, BlockchainSignature, Asset } from '../types'
import { PayloadAndKind } from '../payload'
import { inferBlockchainData, getUnitPairs, getBlockchainMovement } from '../utils/blockchain'
import { buildNEOBlockchainSignatureData, signNEOBlockchainData } from '../signNEOBlockchainData'
import { buildETHBlockchainSignatureData, signETHBlockchainData } from '../signETHBlockchainData'

const curve = new EC('secp256k1')

// Generates the canonical string for the given arbitrary payload.
export const canonicalString = compose(
  toLower,
  JSON.stringify,
  o =>
    Object.keys(o)
      .sort()
      .reduce((acc, el) => ({ ...acc, [el]: o[el] }), {}),
  deep(mapKeys(snakeCase))
)

// Signs the given payload with the given private key.
export default function signPayload(
  privateKey: Buffer,
  payloadAndKind: PayloadAndKind,
  config?: Config
): PayloadSignature {
  const { kind, payload } = payloadAndKind
  const payloadName = kindToName(kind)
  const message = `${payloadName},${canonicalString(payload)}`
  const keypair = curve.keyFromPrivate(privateKey)

  const sig = keypair.sign(SHA256(message).toString(hexEncoding), {
    canonical: true,
    pers: null
  })

  if (needBlockchainSignature(kind)) {
    if (config === undefined) {
      throw new Error('blockchain signatures needs a Config object')
    }
    payload.blockchainSignatures = signBlockchainData(config, { payload, kind })
  }

  if (needBlockchainMovement(kind)) {
    if (config === undefined) {
      throw new Error('blockchain movement needs a Config object')
    }
    return {
      blockchainMovement: getBlockchainMovement(config, { kind, payload }),
      canonicalString: message,
      payload,
      signature: stringify(bufferize(sig.toDER()))
    }
  }

  return {
    canonicalString: message,
    payload,
    signature: stringify(bufferize(sig.toDER()))
  }
}

// If we are trading within the same blockchain origin we only need 1 signature,
// neo_gas, nos_neo, etc..
// Otherwise we are trading cross chain, hence need signatures for both blockchains,
// neo_eth, eth_btc, etc..
export function signBlockchainData(config: Config, payloadAndKind: PayloadAndKind): ReadonlyArray<BlockchainSignature> {
  // Infer blockchain data for the given payload.
  const blockchainData = inferBlockchainData(payloadAndKind)
  const { unitA, unitB } = getUnitPairs(blockchainData.marketName)
  const blockchains: ReadonlyArray<Asset> = [config.assetData[unitA], config.assetData[unitB]]
  const sigs = _.map(_.uniq(blockchains), unit => {
    switch (unit.blockchain) {
      case 'neo':
        const neoData = buildNEOBlockchainSignatureData(config, payloadAndKind)
        return signNEOBlockchainData(config.wallets.neo.privateKey, neoData)
      case 'eth':
        const ethData = buildETHBlockchainSignatureData(config, payloadAndKind)
        return signETHBlockchainData(config.wallets.eth.privateKey, ethData)
      default:
        throw new Error(`invalid unit ${unit}`)
    }
  })

  return sigs
}
