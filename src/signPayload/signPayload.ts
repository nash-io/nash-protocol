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

const curve = new EC('secp256k1')

const config = {
  assetData: {
    gas: {
      blockchain: 'neo',
      hash: '602C79718B16E442DE58778E148D0B1084E3B2DFFD5DE6B7B16CEE7969282DE7',
      precision: 8
    },
    neo: {
      blockchain: 'neo',
      hash: 'C56F33FC6ECFCD0C225C4AB356FEE59390AF8560BE0E930FAEBE74A6DAFF7C9B',
      precision: 8
    }
  },
  marketData: {},
  wallets: {
    neo: {
      address: 'Aet6eGnQMvZ2xozG3A3SvWrMFdWMvZj1cU',
      privateKey: '7146c0beb313d849809a263d3e112b7c14801c381ddc8b793ab751d451886716',
      publicKey: '039fcee26c1f54024d19c0affcf6be8187467c9ba4749106a4b897a08b9e8fed23'
    }
  }
}

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

export default function signPayload(
  privateKey: Buffer,
  kind: SigningPayloadID,
  payload: Record<string, any>
): PayloadSignature {
  const payloadName = kindToName(kind)
  const message = `${payloadName},${canonicalString(payload)}`
  const keypair = curve.keyFromPrivate(privateKey)

  const sig = keypair.sign(SHA256(message).toString(hexEncoding), {
    canonical: true,
    pers: null
  })

  if (needBlockchainSignature(kind)) {
    const blockchainSignatures = signBlockchainData(config, { payload, kind })
    console.log(blockchainSignatures)
    console.log(payload)
  }

  // TODO
  // if it's a deposit or whithdrawal request we need to return a blockchain movement
  // to the client.

  return {
    payload: payload,
    signature: stringify(bufferize(sig.toDER()))
  }
}

// If we are trading within the same blockchain origin we only need 1 signature,
// neo_gas, nos_neo, etc..
// Otherwise we are trading cross chain, hence need signatures for both blockchains,
// neo_eth, eth_btc, etc..
export function signBlockchainData(config: Config, payloadAndKind: PayloadAndKind): ReadonlyArray<BlockchainSignature> {
  // Infer blockchain data for the given payload.
  // const blockchainData = inferBlockchainData(kind, payload)
  // const { unitA, unitB } = getUnitPairs(blockchainData.marketName)
  const blockchains: ReadonlyArray<string> = ['neo', 'neo']

  const sigs = _.map(_.uniq(blockchains), val => {
    return createSignatureForBlockchain(config, val, payloadAndKind)
  })

  return sigs
}
