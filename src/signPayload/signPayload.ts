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
import { APIKey } from '../types/MPC'
import {
  kindToName,
  needBlockchainMovement,
  needBlockchainSignature,
  SigningPayloadID,
  isStateSigning,
  isOrderPayload
} from '../payload/signingPayloadID'
import {
  Config,
  BIP44,
  PresignConfig,
  PayloadSignature,
  BlockchainSignature,
  BlockchainData,
  ChainNoncePair
} from '../types'
import {
  PayloadAndKind,
  ClientSignedState,
  SignStatesRequestPayload,
  AddMovementPayload,
  BuyOrSellBuy,
  TransactionDigest
} from '../payload'
import { inferBlockchainData, getUnitPairs, getBlockchainMovement } from '../utils/blockchain'
import {
  buildNEOOrderSignatureData,
  buildNEOMovementSignatureData,
  presignNEOBlockchainData,
  signNEOBlockchainData
} from '../signNEOBlockchainData'
import {
  presignETHBlockchainData,
  buildETHMovementSignatureData,
  buildETHOrderSignatureData,
  signETHBlockchainData
} from '../signETHBlockchainData'

import { signBTC } from '../signBTCBlockchainData/signBTCBlockchainData'

const curve = new EC('secp256k1')

const ORDER_NONCE_IGNORE = 4294967295

/**
 * Generates the canonical string for a given payload.
 *
 * The canonical string is a human-readable JSON representation of the payload
 * parameters. The keys are alphabetized, and are represented in snake case.
 */
export const canonicalString = compose(
  toLower,
  JSON.stringify,
  o =>
    Object.keys(o)
      .sort()
      .reduce((acc, el) => ({ ...acc, [el]: o[el] }), {}),
  deep(mapKeys(snakeCase))
)

/**
 * Different payload types have different preprocessing strategies. This is a
 * convenience function to properly process various payloads.
 */
export const canonicalizePayload = (kind: SigningPayloadID, payload: object): string => {
  switch (kind) {
    case SigningPayloadID.signStatesPayload:
    case SigningPayloadID.syncStatePayload:
      const signStatesPayload = { timestamp: (payload as any).timestamp }
      return canonicalString(signStatesPayload)
    case SigningPayloadID.addMovementPayload:
      const newPayload: AddMovementPayload = { ...payload }
      delete newPayload.recycled_orders
      delete newPayload.digests
      return canonicalString(newPayload)
    case SigningPayloadID.listOrderPayload:
      const newOrderPayload: any = { ...payload }
      delete newOrderPayload.limit
      return canonicalString(newOrderPayload)
    case SigningPayloadID.listTradePayload:
      const newTradePayload: any = { ...payload }
      delete newTradePayload.limit
      return canonicalString(newTradePayload)
    default:
      if (isOrderPayload(kind)) {
        const tempPayload = alterOrderPayloadForGraphql(payload)
        return canonicalString(tempPayload)
      }

      return canonicalString(payload)
  }
}

/**
 * Signs a payload using a private key. The private key should be the key
 * created by initialization of the Nash Protocol. Payloads are signed via
 * [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)
 * using [secp256k1](https://en.bitcoin.it/wiki/Secp256k1).
 *
 * If the payload to be signed is for a blockchain operation, the `Config`
 * object must be passed as well to create the blockchain signatures.
 *
 * Refer to the documentation for the `Config` interface and to `initialize.ts`.
 */
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
  const canonicalStringHex = SHA256(message).toString(hexEncoding)
  const sig = keypair.sign(canonicalStringHex, {
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
      payload = alterOrderPayloadForGraphql(payload)
    }
  }

  if (needBlockchainMovement(kind)) {
    if (config === undefined) {
      throw new Error('blockchain movement needs a Config object')
    }

    const addMovementPayload = payload as AddMovementPayload
    const addMovementPayloadRequest = { ...payload }
    addMovementPayloadRequest.resigned_orders = signRecycledOrdersForAddMovement(config, addMovementPayload)
    addMovementPayloadRequest.signed_transaction_elements = signTransactionDigestsForAddMovement(config, payload)
    const movement = getBlockchainMovement(config, { kind, payload })
    delete (addMovementPayloadRequest as any).blockchainSignatures
    return {
      blockchainMovement: movement,
      canonicalString: message,
      payload: addMovementPayloadRequest,
      signature: stringify(bufferize(sig.toDER())).toLowerCase()
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

/**
 * Presigns a payload using a apikey.
 * @param  {APIKey}                    apiKey         [description]
 * @param  {PayloadAndKind}            payloadAndKind [description]
 * @param  {PresignConfig}             config         [description]
 * @return {Promise<PayloadSignature>}                [description]
 */
export async function preSignPayload(
  apiKey: APIKey,
  payloadAndKind: PayloadAndKind,
  config: PresignConfig
): Promise<PayloadSignature> {
  let blockchainRaw: any
  const kind = payloadAndKind.kind
  let payload = payloadAndKind.payload
  const payloadName = kindToName(kind)
  const message = `${payloadName},${canonicalizePayload(kind, payload)}`
  const messageHash = SHA256(message).toString(hexEncoding)
  const keypair = curve.keyFromPrivate(apiKey.payload_signing_key)

  const sig = keypair.sign(messageHash, {
    canonical: true,
    pers: null
  })

  if (needBlockchainSignature(kind)) {
    if (config == null) {
      throw new Error('blockchain signatures needs a Config object')
    }
    payload.blockchainSignatures = await presignBlockchainData(apiKey, config, { payload, kind })
    if (isOrderPayload(kind)) {
      blockchainRaw = addRawPresignBlockchainOrderData(apiKey, config, { payload, kind })
      payload = alterOrderPayloadForGraphql(payload)
    }
  }

  if (needBlockchainMovement(kind)) {
    if (config == null) {
      throw new Error('blockchain movement needs a Config object')
    }
    ;(payload as AddMovementRequestPayload).resigned_orders = await presignRecycledOrdersForAddMovement(
      apiKey,
      config,
      payload as AddMovementPayload
    )
    delete (payload as AddMovementPayload).recycled_orders
    const movement = getBlockchainMovement(
      {
        eth: {
          address: apiKey.child_keys[BIP44.ETH].address,
          publicKey: apiKey.child_keys[BIP44.ETH].public_key
        },
        neo: {
          address: apiKey.child_keys[BIP44.NEO].address,
          publicKey: apiKey.child_keys[BIP44.NEO].public_key
        }
      },
      config.assetData,
      { kind, payload }
    )
    delete (payload as any).blockchainSignatures
    return {
      blockchainMovement: movement,
      canonicalString: message,
      payload,
      signature: stringify(bufferize(sig.toDER())).toLowerCase()
    }
  }

  if (isStateSigning(kind)) {
    payload = await presignRecycledOrdersForAddMovement(apiKey, config, payload)
  }

  return {
    blockchainRaw,
    canonicalString: message,
    payload,
    signature: stringify(bufferize(sig.toDER()))
  }
}

/**
 * Presign blockchain data. Returns an array of signatures. Needed for operations
 * such as order placement.
 *
 * If the operation occurs within the same blockchain origin, 1 signature is
 * returned. For example, 1 signature is returned when trading NEO for GAS.
 *
 * If the operation is cross-chain, 2 signatures are returned. For example, two
 * signatures are returned for a BTC-ETH trade.
 */
export async function presignBlockchainData(
  apiKey: APIKey,
  config: PresignConfig,
  payloadAndKind: PayloadAndKind
): Promise<ReadonlyArray<BlockchainSignature>> {
  // if this is a movement we don't want to do all the stuff below
  if (payloadAndKind.kind === SigningPayloadID.addMovementPayload) {
    const blockchain = config.assetData[payloadAndKind.payload.quantity.currency].blockchain
    switch (blockchain) {
      case 'neo':
        const neoData = buildNEOMovementSignatureData(
          apiKey.child_keys[BIP44.NEO].address,
          apiKey.child_keys[BIP44.NEO].public_key,
          config.assetData,
          payloadAndKind
        )
        const neoSig = await presignNEOBlockchainData(apiKey, config, neoData)
        return [neoSig]
      case 'eth':
        const ethData = buildETHMovementSignatureData(apiKey.child_keys[BIP44.ETH].address, payloadAndKind)
        const ethSig = await presignETHBlockchainData(apiKey, config, ethData)
        return [ethSig]
      case 'btc':
        throw new Error('Not implemented')
    }
  }
  const blockchainData = inferBlockchainData(payloadAndKind)
  const signatureNeeded: ChainNoncePair[] = determineSignatureNonceTuplesNeeded(config.assetData, blockchainData)
  const sigs: BlockchainSignature[] = []
  for (const chainNoncePair of signatureNeeded) {
    switch (chainNoncePair.chain) {
      case 'neo':
        const neoData = buildNEOOrderSignatureData(
          apiKey.child_keys[BIP44.NEO].address,
          apiKey.child_keys[BIP44.NEO].public_key,
          config.assetData,
          config.marketData,
          payloadAndKind,
          chainNoncePair
        )
        const neoSignature = await presignNEOBlockchainData(apiKey, config, neoData)
        sigs.push({
          ...neoSignature,
          nonceFrom: chainNoncePair.nonceFrom,
          nonceTo: chainNoncePair.nonceTo,
          publicKey: apiKey.child_keys[BIP44.NEO].public_key.toLowerCase()
        })
        break
      case 'eth':
        const ethData = buildETHOrderSignatureData(
          apiKey.child_keys[BIP44.ETH].address,
          config.marketData,
          payloadAndKind,
          chainNoncePair
        )
        const ethSignature = await presignETHBlockchainData(apiKey, config, ethData)
        sigs.push({
          ...ethSignature,
          nonceFrom: chainNoncePair.nonceFrom,
          nonceTo: chainNoncePair.nonceTo,
          publicKey: apiKey.child_keys[BIP44.ETH].public_key
        })
        break
      case 'btc':
        throw new Error('Not implemented')

      default:
        throw new Error(`invalid blockchain ${chainNoncePair.chain}`)
    }
  }

  return sigs
}

/**
 * Signs blockchain data. Returns an array of signatures. Needed for operations
 * such as order placement.
 *
 * If the operation occurs within the same blockchain origin, 1 signature is
 * returned. For example, 1 signature is returned when trading NEO for GAS.
 *
 * If the operation is cross-chain, 2 signatures are returned. For example, two
 * signatures are returned for a BTC-ETH trade.
 */
export function signBlockchainData(config: Config, payloadAndKind: PayloadAndKind): ReadonlyArray<BlockchainSignature> {
  // if this is a movement we don't want to do all the stuff below
  if (payloadAndKind.kind === SigningPayloadID.addMovementPayload) {
    const blockchain = config.assetData[payloadAndKind.payload.quantity.currency].blockchain
    switch (blockchain) {
      case 'neo':
        const neoData = buildNEOMovementSignatureData(
          config.wallets.neo.address,
          config.wallets.neo.publicKey,
          config.assetData,
          payloadAndKind
        )
        return [signNEOBlockchainData(config.wallets.neo.privateKey, neoData)]
      case 'eth':
        const ethData = buildETHMovementSignatureData(config.wallets.eth.address, payloadAndKind)
        return [signETHBlockchainData(config.wallets.eth.privateKey, ethData)]
      case 'btc':
        return []
    }
  }

  // if this is an order then its a bit more complicated
  const blockchainData = inferBlockchainData(payloadAndKind)
  const signatureNeeded: ChainNoncePair[] = determineSignatureNonceTuplesNeeded(config.assetData, blockchainData)

  const sigs = signatureNeeded.map(chainNoncePair => {
    switch (chainNoncePair.chain) {
      case 'neo':
        const neoData = buildNEOOrderSignatureData(
          config.wallets.neo.address,
          config.wallets.neo.publicKey,
          config.assetData,
          config.marketData,
          payloadAndKind,
          chainNoncePair
        )
        const neoSignature = signNEOBlockchainData(config.wallets.neo.privateKey, neoData)
        return {
          ...neoSignature,
          nonceFrom: chainNoncePair.nonceFrom,
          nonceTo: chainNoncePair.nonceTo,
          publicKey: config.wallets.neo.publicKey.toLowerCase()
        }
      case 'eth':
        const ethData = buildETHOrderSignatureData(
          config.wallets.eth.address,
          config.marketData,
          payloadAndKind,
          chainNoncePair
        )
        const ethSignature = signETHBlockchainData(config.wallets.eth.privateKey, ethData)
        return {
          ...ethSignature,
          nonceFrom: chainNoncePair.nonceFrom,
          nonceTo: chainNoncePair.nonceTo,
          publicKey: config.wallets.eth.publicKey.toLowerCase()
        }
      case 'btc':
        return {
          blockchain: 'BTC',
          nonceFrom: chainNoncePair.nonceFrom,
          nonceTo: chainNoncePair.nonceTo,
          publicKey: config.wallets.btc.publicKey.toLowerCase(),
          signature: ''
        }

      default:
        throw new Error(`invalid blockchain ${chainNoncePair.chain}`)
    }
  })

  return sigs
}

/**
 * @TODO Add documentation.
 */
export function determineSignatureNonceTuplesNeeded(
  assetData: Config['assetData'],
  blockchainData: BlockchainData
): ChainNoncePair[] {
  const { unitA, unitB } = getUnitPairs(blockchainData.marketName)

  let assetFrom = unitA
  let assetTo = unitB

  if (blockchainData.buyOrSell === BuyOrSellBuy) {
    assetFrom = unitB
    assetTo = unitA
  }

  const blockchainFrom = assetData[assetFrom].blockchain
  const blockchainTo = assetData[assetTo].blockchain
  const blockchains = _.uniq([blockchainFrom, blockchainTo])
  const needed: ChainNoncePair[] = []

  blockchains.forEach(blockchain => {
    blockchainData.noncesFrom.forEach(nonceFrom => {
      blockchainData.noncesTo.forEach(nonceTo => {
        const nFrom = blockchain === blockchainFrom ? nonceFrom : ORDER_NONCE_IGNORE
        const nTo = blockchain === blockchainTo ? nonceTo : ORDER_NONCE_IGNORE
        needed.push({ chain: blockchain, nonceFrom: nFrom, nonceTo: nTo })
      })
    })
  })
  return _.uniqWith(needed, _.isEqual)
}

/**
 * @TODO Add documentation.
 */
export function addRawBlockchainOrderData(config: Config, payloadAndKind: PayloadAndKind): object {
  const blockchainData = inferBlockchainData(payloadAndKind)
  const signatureNeeded: ChainNoncePair[] = determineSignatureNonceTuplesNeeded(config.assetData, blockchainData)

  const rawData = signatureNeeded.map(chainNoncePair => {
    switch (chainNoncePair.chain) {
      case 'neo':
        return {
          payload: payloadAndKind.payload,
          raw: buildNEOOrderSignatureData(
            config.wallets.neo.address,
            config.wallets.neo.publicKey,
            config.assetData,
            config.marketData,
            payloadAndKind,
            chainNoncePair
          )
        }
      case 'eth':
        return {
          payload: payloadAndKind.payload,
          raw: buildETHOrderSignatureData(config.wallets.eth.address, config.marketData, payloadAndKind, chainNoncePair)
        }
      case 'btc':
        return {
          payload: payloadAndKind.payload,
          raw: ''
        }
      default:
        throw new Error(`invalid chain ${chainNoncePair.chain}`)
    }
  })

  return rawData
}

export function addRawPresignBlockchainOrderData(
  apiKey: APIKey,
  config: PresignConfig,
  payloadAndKind: PayloadAndKind
): object {
  const blockchainData = inferBlockchainData(payloadAndKind)
  const signatureNeeded: ChainNoncePair[] = determineSignatureNonceTuplesNeeded(config.assetData, blockchainData)

  const rawData = signatureNeeded.map(chainNoncePair => {
    switch (chainNoncePair.chain) {
      case 'neo':
        return {
          payload: payloadAndKind.payload,
          raw: buildNEOOrderSignatureData(
            apiKey.child_keys[BIP44.NEO].address,
            apiKey.child_keys[BIP44.NEO].public_key,
            config.assetData,
            config.marketData,
            payloadAndKind,
            chainNoncePair
          )
        }
      case 'eth':
        return {
          payload: payloadAndKind.payload,
          raw: buildETHOrderSignatureData(
            apiKey.child_keys[BIP44.ETH].address,
            config.marketData,
            payloadAndKind,
            chainNoncePair
          )
        }
      case 'btc':
        throw new Error('Not implemented')
      default:
        throw new Error(`invalid chain ${chainNoncePair.chain}`)
    }
  })

  return rawData
}

/*
 * @TODO Add documentation.
 */
export function signStateListAndRecycledOrders(config: Config, payload: any): SignStatesRequestPayload {
  return {
    client_signed_states: signStateList(config, payload.states),
    signed_recycled_orders: signStateList(config, payload.recycled_orders),
    timestamp: payload.timestamp
  }
}

/*
 * @TODO Add documentation.
 */
export function signRecycledOrdersForAddMovement(config: Config, payload: AddMovementPayload): ClientSignedState[] {
  if (payload.recycled_orders !== undefined) {
    return signStateList(config, payload.recycled_orders as ClientSignedState[])
  }
  return []
}

export function presignRecycledOrdersForAddMovement(
  apiKey: APIKey,
  config: PresignConfig,
  payload: AddMovementPayload
): Promise<ClientSignedState[]> {
  if (payload.recycled_orders !== undefined) {
    return presignStateList(apiKey, config, payload.recycled_orders as ClientSignedState[])
  }
  return Promise.resolve([])
}

/*
 * @TODO Add documentation.
 */
export function signTransactionDigestsForAddMovement(config: Config, payload: AddMovementPayload): ClientSignedState[] {
  if (payload.digests !== undefined) {
    const result: ClientSignedState[] = payload.digests.map((item: TransactionDigest) => {
      const signedTransactionElement: ClientSignedState = {
        blockchain: 'BTC',
        message: item.digest,
        signature: signBTC(config.wallets.btc.privateKey, item.digest).signature
      }
      return signedTransactionElement
    })
    return result
  }
  return []
}

/*
 * @TODO Add documentation.
 */
export function signStateList(config: Config, items: ClientSignedState[]): ClientSignedState[] {
  const result: ClientSignedState[] = items.map((item: ClientSignedState) => {
    switch (item.blockchain.toLowerCase()) {
      case 'neo':
        item.signature = signNEOBlockchainData(config.wallets.neo.privateKey, item.message).signature
        return item
      case 'eth':
        item.signature = signETHBlockchainData(config.wallets.eth.privateKey, item.message).signature
        return item
      case 'btc':
        item.signature = signBTC(config.wallets.btc.privateKey, item.message).signature
        return item
      default:
        throw new Error(`Cannot sign states for blockchain ${item.blockchain}`)
    }
  })
  return result
}

export async function presignStateList(
  apiKey: APIKey,
  config: PresignConfig,
  items: ClientSignedState[]
): Promise<ClientSignedState[]> {
  const result: ClientSignedState[] = []
  for (const item of items) {
    switch (item.blockchain.toLowerCase()) {
      case 'neo':
        item.signature = (await presignNEOBlockchainData(apiKey, config, item.message)).signature
        result.push(item)
        break
      case 'eth':
        item.signature = (await presignETHBlockchainData(apiKey, config, item.message)).signature
        result.push(item)
        break
      default:
        throw new Error(`Cannot sign states for blockchain ${item.blockchain}`)
    }
  }
  return result
}

/*
 * @TODO Add documentation.
 */
export function alterOrderPayloadForGraphql(payload: any): any {
  // for order nonce_from/nonce_to, this is actually tracked from within the payload blockchain signatures object
  // its also possibly a list of nonces for each!
  // unfortunately the graphql schema expects nonce_from/nonce_to so we'll add a dummy value
  // and delete nonces_from/nonces_to from the payload for canonical string purposes
  const tempPayload: any = { ...payload }
  delete tempPayload.noncesFrom
  delete tempPayload.noncesTo
  tempPayload.nonceFrom = ORDER_NONCE_IGNORE
  tempPayload.nonceTo = ORDER_NONCE_IGNORE
  return tempPayload
}
