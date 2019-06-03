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
import { createSignatureForBlockchain } from '../blockchainSignature'

import { kindToName, needBlockchainSignature, SigningPayloadID } from '../payload/signingPayloadID'
import { Config, PayloadSignature, BlockchainSignature } from '../types'
import { PayloadAndKind } from '../payload'
import { inferBlockchainData, getUnitPairs } from '../blockchainSignature/helpers'

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
  kind: SigningPayloadID,
  payload: Record<string, any>,
  config?: Config
): PayloadSignature {
  const payloadName = kindToName(kind)
  const message = `${payloadName},${canonicalString(payload)}`
  const keypair = curve.keyFromPrivate(privateKey)

  const sig = keypair.sign(SHA256(message).toString(hexEncoding), {
    canonical: true,
    pers: null
  })

  if (needBlockchainSignature(kind)) {
    if (config === undefined) {
      throw new Error('blockchain signatures need a Config object')
    }
    payload.blockchainSignatures = signBlockchainData(config, { payload, kind })
  }

  // TODO(anthdm)
  // if it's a deposit or whithdrawal request we need to return a blockchain movement
  // to the client.

  return {
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
  const blockchains: ReadonlyArray<string> = [unitA, unitB]

  const sigs = _.map(_.uniq(blockchains), val => {
    return createSignatureForBlockchain(config, val, payloadAndKind)
  })

  return sigs
}
