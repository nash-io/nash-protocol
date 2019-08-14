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

import {
  kindToName,
  needBlockchainMovement,
  needBlockchainSignature,
  SigningPayloadID,
  isStateSigning,
  isOrderPayload
} from '../payload/signingPayloadID'
import { Config, PayloadSignature, BlockchainSignature } from '../types'
import {
  PayloadAndKind,
  SignStatesPayload,
  ClientSignedState,
  SignStatesRequestPayload,
  AddMovementPayload,
  AddMovementRequestPayload
} from '../payload'
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

export const canonicalizePayload = (kind: SigningPayloadID, payload: object): string => {
  switch (kind) {
    case SigningPayloadID.signStatesPayload:
      const signStatesPayload = { timestamp: (payload as SignStatesPayload).timestamp }
      return canonicalString(signStatesPayload)
    case SigningPayloadID.addMovementPayload:
      const newPayload: AddMovementPayload = { ...payload }
      delete newPayload.recycled_orders
      return canonicalString(newPayload)
    default:
      return canonicalString(payload)
  }
}

// Signs the given payload with the given private key.
export default function signPayload(
  privateKey: Buffer,
  payloadAndKind: PayloadAndKind,
  config?: Config
): PayloadSignature {
  let blockchainRaw: any

  const kind = payloadAndKind.kind
  let payload = payloadAndKind.payload
  const payloadName = kindToName(kind)
  const message = `${payloadName},${canonicalizePayload(kind, payload)}`
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
    if (isOrderPayload(kind)) {
      blockchainRaw = addRawBlockchainOrderData(config, { payload, kind })
    }
  }

  if (needBlockchainMovement(kind)) {
    if (config === undefined) {
      throw new Error('blockchain movement needs a Config object')
    }

    ;(payload as AddMovementRequestPayload).resigned_orders = signRecycledOrdersForAddMovement(
      config as Config,
      payload as AddMovementPayload
    )
    delete (payload as AddMovementPayload).recycled_orders
    const movement = getBlockchainMovement(config, { kind, payload })
    delete (payload as any).blockchainSignatures
    return {
      blockchainMovement: movement,
      canonicalString: message,
      payload,
      signature: stringify(bufferize(sig.toDER()))
    }
  }

  if (isStateSigning(kind)) {
    payload = signStateListAndRecycledOrders(config as Config, payload)
  }

  return {
    blockchainRaw,
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
  // if this is a movement we don't want to do all the stuff below
  if (payloadAndKind.kind === SigningPayloadID.addMovementPayload) {
    const blockchain = config.assetData[payloadAndKind.payload.quantity.currency].blockchain
    switch (blockchain) {
      case 'neo':
        const neoData = buildNEOBlockchainSignatureData(config, payloadAndKind)
        return [signNEOBlockchainData(config.wallets.neo.privateKey, neoData)]
      case 'eth':
        const ethData = buildETHBlockchainSignatureData(config, payloadAndKind)
        return [signETHBlockchainData(config.wallets.eth.privateKey, ethData)]
    }
  }

  // if this is an order then its a bit more complicated
  const blockchainData = inferBlockchainData(payloadAndKind)
  const { unitA, unitB } = getUnitPairs(blockchainData.marketName)
  const blockchains: ReadonlyArray<string> = [config.assetData[unitA].blockchain, config.assetData[unitB].blockchain]
  const sigs = _.map(_.uniq(blockchains), blockchain => {
    switch (blockchain) {
      case 'neo':
        const neoData = buildNEOBlockchainSignatureData(config, payloadAndKind)
        return signNEOBlockchainData(config.wallets.neo.privateKey, neoData)
      case 'eth':
        const ethData = buildETHBlockchainSignatureData(config, payloadAndKind)
        return signETHBlockchainData(config.wallets.eth.privateKey, ethData)
      default:
        throw new Error(`invalid blockchain ${blockchain}`)
    }
  })

  return sigs
}

// If we are trading within the same blockchain origin we only need 1 signature,
// neo_gas, nos_neo, etc..
// Otherwise we are trading cross chain, hence need signatures for both blockchains,
// neo_eth, eth_btc, etc..
export function addRawBlockchainOrderData(config: Config, payloadAndKind: PayloadAndKind): object {
  // if this is an order then its a bit more complicated
  const blockchainData = inferBlockchainData(payloadAndKind)
  const { unitA, unitB } = getUnitPairs(blockchainData.marketName)
  const blockchains: ReadonlyArray<string> = [config.assetData[unitA].blockchain, config.assetData[unitB].blockchain]
  const rawData = _.map(_.uniq(blockchains), blockchain => {
    switch (blockchain) {
      case 'neo':
        return {
          payload: payloadAndKind.payload,
          raw: buildNEOBlockchainSignatureData(config, payloadAndKind).toUpperCase()
        }
      case 'eth':
        return {
          payload: payloadAndKind.payload,
          raw: buildETHBlockchainSignatureData(config, payloadAndKind).toUpperCase()
        }
      default:
        throw new Error(`invalid chain ${blockchain}`)
    }
  })

  return rawData
}

export function signStateListAndRecycledOrders(config: Config, payload: any): SignStatesRequestPayload {
  const signStatesPayload = payload as SignStatesPayload
  return {
    client_signed_states: signStateList(config, signStatesPayload.states),
    signed_recycled_orders: signStateList(config, signStatesPayload.recycled_orders),
    timestamp: signStatesPayload.timestamp
  }
}

export function signRecycledOrdersForAddMovement(config: Config, payload: AddMovementPayload): ClientSignedState[] {
  if (payload.recycled_orders !== undefined) {
    return signStateList(config, payload.recycled_orders as ClientSignedState[])
  }
  return []
}

export function signStateList(config: Config, items: ClientSignedState[]): ClientSignedState[] {
  const result: ClientSignedState[] = items.map((item: ClientSignedState) => {
    switch (item.blockchain.toLowerCase()) {
      case 'neo':
        item.signature = signNEOBlockchainData(config.wallets.neo.privateKey, item.message).signature.toUpperCase()
        return item
      case 'eth':
        item.signature = signETHBlockchainData(config.wallets.eth.privateKey, item.message).signature.toUpperCase()
        return item
      default:
        throw new Error(`Cannot sign states for blockchain ${item.blockchain}`)
    }
  })
  return result
}
