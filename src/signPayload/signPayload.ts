import hexEncoding from 'crypto-js/enc-hex'
import SHA256 from 'crypto-js/sha256'
import { ec as EC } from 'elliptic'
import _ from 'lodash'
import compose from 'lodash/fp/compose'
import mapKeys from 'lodash/fp/mapKeys'
import snakeCase from 'lodash/fp/snakeCase'
import toLower from 'lodash/fp/toLower'
import { SmartBuffer } from 'smart-buffer'

import Neon from '@cityofzion/neon-js'

import bufferize from '../bufferize'
import stringify from '../stringify'
import deep from '../utils/deep'

import {
  isLimitOrderPayload,
  isOrderPayload,
  kindToName,
  needBlockchainSignature,
  SigningPayloadID,
  kindToOrderPrefix
} from './signingPayloadID'

import { Wallet } from '../wallet'

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

interface PayloadSignature {
  readonly signature: string
  readonly blockchainData?: any
}

// BlockchainSignature holds the signed digest of blockchain specific data.
interface BlockchainSignature {
  readonly blockchain: string
  readonly signature: string
}

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
    const blockchainSignatures = signBlockchainData(config, { payload, kind })
    console.log(blockchainSignatures)
  }

  // TODO
  // if it's a deposit or whithdrawal request we need to return a blockchain movement
  // to the client.

  return {
    signature: stringify(bufferize(sig.toDER()))
  }
}

interface BlockchainData {
  readonly amount: string
  readonly marketName: string
  readonly nonce: number
  readonly nonceFrom: number
  readonly nonceTo: number
  readonly nonceOrder: number
}

// infers the blockchain specific data we need for the given payload. Some payloads
// have different fields, hence need different approach to retrieve the data we need.
function inferBlockchainData(payloadAndKind: PayloadAndKind): BlockchainData {
  const { payload, kind } = payloadAndKind

  switch (kind) {
    case SigningPayloadID.placeMarketOrderPayload:
    case SigningPayloadID.placeStopMarketOrderPayload:
    case SigningPayloadID.placeLimitOrderPayload:
    case SigningPayloadID.placeStopLimitOrderPayload:
      return {
        amount: payload.amount.amount,
        marketName: payload.market,
        nonce: payload.nonce,
        nonceFrom: payload.nonceFrom,
        nonceOrder: payload.nonceOrder,
        nonceTo: payload.nonceTo
      }
      break
    default:
      throw new Error('invalid kind')
  }
}

function getUnitPairs(market: string): any {
  const pairs = market.split('_')
  return {
    unitA: pairs[0],
    unitB: pairs[1]
  }
}

interface Config {
  readonly assetData: { readonly [key: string]: Asset }
  readonly marketData: any
  readonly wallets: { readonly [key: string]: Wallet }
}

interface Asset {
  readonly blockchain: string
  readonly hash: string
  readonly precision: number
}

// holds the payload along with its kind.
interface PayloadAndKind {
  readonly payload: any
  readonly kind: SigningPayloadID
}

// If we are trading within the same blockchain origin we only need 1 signature,
// neo_gas, nos_neo, etc..
// Otherwise we are trading cross chain, hence need signatures for both blockchains,
// neo_eth, eth_btc, etc..
function signBlockchainData(config: Config, payloadAndKind: PayloadAndKind): ReadonlyArray<BlockchainSignature> {
  // Infer blockchain data for the given payload.
  // const blockchainData = inferBlockchainData(kind, payload)
  // const { unitA, unitB } = getUnitPairs(blockchainData.marketName)
  const blockchains: ReadonlyArray<string> = ['neo', 'neo']

  const sigs = _.map(_.uniq(blockchains), val => {
    return createSignatureForBlockchain(config, val, payloadAndKind)
  })

  return sigs
}

function createSignatureForBlockchain(
  config: Config,
  blockchain: string,
  payloadAndKind: PayloadAndKind
): BlockchainSignature {
  switch (blockchain) {
    case 'neo':
      const data = buildNEOBlockchainSignatureData(config, payloadAndKind)
      const signature = signNEOBlockchainData(config.wallets.neo.privateKey, data)

      return {
        blockchain: 'neo',
        signature
      }
    case 'eth':
      return signETHBlockchainData(config, payloadAndKind)
    default:
      throw new Error(`signatures for blockchain (${blockchain} is not supported`)
  }
}

function signNEOBlockchainData(privateKey: string, data: string): string {
  const keypair = curve.keyFromPrivate(privateKey)
  return keypair.sign(data).toDER()
}

const minOrderRate = 0
const maxOrderRate = 18446744073709551615
// const maxOrderRateEth = 4294967295
const maxFeeRate = 250000

// The signature data is build as follows:
// 1. prefix => ???
// 2. scriptHash of the public key
// 3. scriptHash of asset A
// 4. scriptHash of asset B
// 5. nonceTo
// 6. nonceFrom
// 7. amount
// 8. minRate => only for orders
// 9. maxRate => only for orders
// 10. maxFee => only for orders
// 11. nonceOrder
// 12. publicKey
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
  buffer.writeString(reverseHexString(getNEOScriptHash(config)))
  buffer.writeString(reverseHexString(config.assetData[unitA].hash))

  // only orders have a destination market.
  if (isOrderPayload(kind)) {
    buffer.writeString(reverseHexString(config.assetData[unitB].hash))
    buffer.writeString(toLittleEndian(blockchainData.nonceTo))
    buffer.writeString(toLittleEndian(blockchainData.nonceFrom))
  }

  // buffer.write(toLittleEndian(blockchainData.amount))
  buffer.writeString('0xffff')

  // only write the fee's when the it's an order.
  if (isOrderPayload(kind)) {
    // NOTE: limit orders price needs normalization.
    if (isLimitOrderPayload(kind)) {
      // TODO: normalization on the price of the limit order.
      buffer.writeString(toLittleEndian(minOrderRate))
      buffer.writeString(toLittleEndian(maxOrderRate))
      buffer.writeString(toLittleEndian(maxFeeRate))
    }

    // TODO: need normalization whith precicions
    buffer.writeString(toLittleEndian(minOrderRate))
    buffer.writeString(toLittleEndian(maxOrderRate))
    buffer.writeString(toLittleEndian(maxFeeRate))
  }

  // use the nonceOrder field when we need to sign any order payload.
  if (isOrderPayload(kind)) {
    buffer.writeString(toLittleEndian(blockchainData.nonceOrder))
  } else {
    buffer.writeString(toLittleEndian(blockchainData.nonce))
  }
  buffer.writeString(config.wallets.neo.publicKey)

  // Already written everthing in hex, so just return the utf8 string from the
  // buffer.
  return buffer.toString('utf8')
}

function signETHBlockchainData(config: Config, payload: any): BlockchainSignature {
  console.log(payload)
  console.log(config)
  return {
    blockchain: '',
    signature: ''
  }
}

// Retrieves the NEO script hash from the given Config object.
function getNEOScriptHash(config: Config): string {
  if (!('neo' in config.wallets)) {
    throw new Error('wallet data for NEO not found in config.wallets')
  }

  return Neon.create.account(config.wallets.neo.address).scriptHash
}

// Returns the given number as little endian in hex format.
export function toLittleEndian(n: number): string {
  const buf = new Buffer(8)

  buf.fill(0)
  buf.writeUInt32LE(n & 0x00ff, 0) // write the low order bits
  buf.writeUInt32LE(n >> 8, 1) // write the low order bits (shifted over)

  return buf.toString('hex')
}

// function getETHAssetID(asset: string): string {
//   switch (asset) {
//     case 'eth':
//       return '0000'
//     case 'bat':
//       return '0001'
//     case 'omg':
//       return '0002'
//     case 'usdc':
//       return '0003'
//     case 'bnb':
//       return '0004'
//     default:
//       return 'ffff'
//   }
// }

function reverseHexString(hex: string): string {
  const rev = hex.match(/[a-fA-F0-9]{2}/g)
  if (!rev) {
    throw new Error('invalid hex string given')
  }
  return rev.reverse().join('')
}
