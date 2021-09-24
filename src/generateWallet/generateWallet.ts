import * as bip32 from 'bip32'
import { Wallet } from '../types'
import { reverseHex } from '../utils/getNEOScriptHash/getNEOScripthash'
import * as EthUtil from 'ethereumjs-util'
import * as Bitcoin from 'bitcoinjs-lib'
import bchaddr from 'bchaddrjs'
import * as tiny from 'tiny-secp256k1'
import * as coininfo from 'coininfo'

import base58 from 'bs58'
import hexEncoding from 'crypto-js/enc-hex'
import RIPEMD160 from 'crypto-js/ripemd160'
import SHA256 from 'crypto-js/sha256'
import { ec as EC } from 'elliptic'

const curve = new EC('p256')
const bip44Purpose = 44
const nashPurpose = 1337

export enum CoinType {
  BTC = 0,
  LTC = 2,
  DOGE = 3,
  ETH = 60,
  ETC = 61,
  BCH = 145,
  DOT = 354,
  ERD = 508,
  NEO = 888,
  AVAXC = 9000
}

const NON_SEGWIT = [CoinType.BCH, CoinType.DOGE]

// interface DotKeyPair {
//   publicKey: Uint8Array
//   address: string
// }
/**
 * Creates a wallet for a given token via the
 * [BIP-44 protocol]((https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki).
 *
 * Requires the user's master seed.
 */
export function generateWallet(masterSeed: Buffer, coinType: CoinType, index: number, net?: string): Wallet {
  const key = derivePath(masterSeed, bip44Purpose, coinType, 0, 0)
  const derivedChainKey = deriveIndex(key, index)

  return generateWalletForCoinType(derivedChainKey, coinType, index, net)
}

/**
 * Creates the keypair used for signing payloads. Used during Nash Protocol
 * initialization.
 */
export function generateNashPayloadSigningKey(masterSeed: Buffer, index: number): Wallet {
  const extendedKey = derivePath(masterSeed, nashPurpose, 0, 0, 0)
  const key = deriveIndex(extendedKey, index)

  if (key.privateKey === undefined) {
    throw new Error('private key is undefined')
  }

  return {
    address: '',
    index,
    privateKey: key.privateKey.toString('hex').toLowerCase(),
    publicKey: key.publicKey.toString('hex').toLowerCase()
  }
}

/**
 * Generates a deterministic key according to the BIP-44 spec.
 *
 * `M' / purpose' / coin' / account' / change / index`
 * `M' / 44' / coin' / 0' / 0`
 */
export function generateBIP44Key(masterSeed: Buffer, coinType: CoinType, index: number): bip32.BIP32Interface {
  const extendedKey = derivePath(masterSeed, bip44Purpose, coinType, 0, 0)
  const chainKey = deriveIndex(extendedKey, index)

  return chainKey
}

/**
 * Derives a new key from the extended key for the given index.
 */
export function deriveIndex(extendedKey: bip32.BIP32Interface, index: number): bip32.BIP32Interface {
  return extendedKey.derive(index)
}

export const coinTypeFromString = (s: string): CoinType => {
  const m: Record<string, CoinType> = {
    avaxc: CoinType.AVAXC,
    bch: CoinType.BCH,
    btc: CoinType.BTC,
    doge: CoinType.DOGE,
    dot: CoinType.DOT,
    erd: CoinType.ERD,
    etc: CoinType.ETC,
    eth: CoinType.ETH,
    ltc: CoinType.LTC,
    neo: CoinType.NEO
  }

  if (!(s in m)) {
    throw new Error(`invalid name ${s} given to convert to a valid coin type`)
  }

  return m[s]
}

export function neoGetPublicKeyFromPrivateKey(privateKey: string, encode: boolean = true): string {
  const privateKeyBuffer = Buffer.from(privateKey, 'hex')
  const keypair = curve.keyFromPrivate(privateKeyBuffer, 'hex')
  const unencodedPubKey = keypair.getPublic().encode('hex')
  if (encode) {
    const tail = parseInt(unencodedPubKey.substr(64 * 2, 2), 16)
    if (tail % 2 === 1) {
      return '03' + unencodedPubKey.substr(2, 64)
    } else {
      return '02' + unencodedPubKey.substr(2, 64)
    }
  } else {
    return unencodedPubKey
  }
}

const getVerificationScriptFromPublicKey = (publicKey: string): string => {
  return '21' + publicKey + 'ac'
}

function hash(hex: string, hashingFunction: (i: any) => CryptoJS.WordArray): string {
  const hexEncoded = hexEncoding.parse(hex)
  const result = hashingFunction(hexEncoded)
  return result.toString(hexEncoding)
}
export function sha256(hex: string): string {
  return hash(hex, SHA256)
}
export function ripemd160(hex: string): string {
  return hash(hex, RIPEMD160)
}
export function hash160(hex: string): string {
  const sha = sha256(hex)
  return ripemd160(sha)
}
export function hash256(hex: string): string {
  const firstSha = sha256(hex)
  return sha256(firstSha)
}

const ADDR_VERSION = '17'

export const getAddressFromScriptHash = (scriptHash: string): string => {
  const scriptHashReversed = reverseHex(scriptHash)
  const shaChecksum = hash256(ADDR_VERSION + scriptHashReversed).substr(0, 8)
  return base58.encode(Buffer.from(ADDR_VERSION + scriptHashReversed + shaChecksum, 'hex'))
}

// NOTE: We can split this out later when there are more wallets needs to be derived.
function generateWalletForCoinType(key: bip32.BIP32Interface, coinType: CoinType, index: number, net?: string): Wallet {
  if (key.privateKey === undefined) {
    throw new Error('private key not properly derived')
  }
  switch (coinType) {
    case CoinType.NEO:
      const neoPrivKey = key.privateKey.toString('hex')
      const publicKey = neoGetPublicKeyFromPrivateKey(neoPrivKey)
      const verifiedScript = getVerificationScriptFromPublicKey(publicKey)
      const scriptHash = reverseHex(hash160(verifiedScript))
      return {
        address: getAddressFromScriptHash(scriptHash),
        index,
        privateKey: neoPrivKey,
        publicKey
      }
    case CoinType.ETH:
    case CoinType.ETC:
    case CoinType.AVAXC:
      // TODO: can we replace this with the elliptic package which we already
      // use to trim bundle size?
      const pubkey = tiny.pointFromScalar(key.privateKey, false)
      return {
        address: EthUtil.pubToAddress(key.publicKey, true).toString('hex'),
        index,
        privateKey: key.privateKey.toString('hex'),
        publicKey: pubkey.toString('hex')
      }
    case CoinType.BTC:
    case CoinType.BCH:
    case CoinType.LTC:
    case CoinType.DOGE:
      return {
        address: bitcoinAddressFromPublicKey(key.publicKey, coinType, net!),
        index,
        privateKey: key.privateKey.toString('hex'),
        publicKey: key.publicKey.toString('hex')
      }
    // case CoinType.DOT:
    //   const keypair = dotKeypairFromSeed(key.privateKey)
    //   return {
    //     address: keypair.address,
    //     index,
    //     privateKey: key.privateKey.toString('hex'),
    //     publicKey: new Buffer(keypair.publicKey).toString('hex')
    //   }
    // case CoinType.ERD:
    //   const account = new erdAccount()
    //   account.loadFromSeed(key.privateKey)
    //   return {
    //     address: account.address(),
    //     index,
    //     privateKey: key.privateKey.toString('hex'),
    //     publicKey: account.publicKeyAsString()
    //   }
    default:
      throw new Error(`invalid coin type ${coinType} for generating a wallet`)
  }
}

const bitcoinAddressFromPublicKey = (publicKey: Buffer, type: CoinType, net: string): string => {
  const network = bitcoinNetworkFromString(type, net)
  if (NON_SEGWIT.includes(type)) {
    const addr = Bitcoin.payments.p2pkh({ pubkey: publicKey, network }).address as string
    // For BCH, we convert to bitcoincash format
    if (type === CoinType.BCH) {
      return bchaddr.toCashAddress(addr)
    }
    return addr
  }
  return Bitcoin.payments.p2sh({
    network,
    redeem: Bitcoin.payments.p2wpkh({ pubkey: publicKey, network })
  }).address as string
}

const bitcoinNetworkFromString = (type: CoinType, net: string | undefined): Bitcoin.Network => {
  switch (type) {
    case CoinType.BTC:
      switch (net) {
        case 'MainNet':
          return Bitcoin.networks.bitcoin
        case 'TestNet':
          return Bitcoin.networks.regtest
        case 'LocalNet':
          return Bitcoin.networks.regtest
        default:
          return Bitcoin.networks.bitcoin
      }
    case CoinType.LTC:
      switch (net) {
        case 'TestNet':
        case 'LocalNet':
          return coininfo.litecoin.test.toBitcoinJS()
        default:
          return coininfo.litecoin.main.toBitcoinJS()
      }
    case CoinType.BCH:
      switch (net) {
        case 'TestNet':
        case 'LocalNet':
          return coininfo.bitcoincash.test.toBitcoinJS()
        default:
          return coininfo.bitcoincash.main.toBitcoinJS()
      }
    case CoinType.DOGE:
      switch (net) {
        case 'TestNet':
        case 'LocalNet':
          return coininfo.dogecoin.test.toBitcoinJS()
        default:
          return coininfo.dogecoin.main.toBitcoinJS()
      }
    default:
      throw new Error(`Could not get bitcoin network for coin type: ${type}`)
  }
}

// const dotKeypairFromSeed = (key: Buffer): DotKeyPair => {
//   const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 })
//   keyring.addFromSeed(key)
//   return keyring.getPairs().shift() as DotKeyPair
// }

function derivePath(
  masterSeed: Buffer,
  purpose: number,
  coinType: CoinType,
  account: number,
  change: number
): bip32.BIP32Interface {
  const masterKey = bip32.fromSeed(masterSeed)
  return masterKey
    .deriveHardened(purpose)
    .deriveHardened(coinType)
    .deriveHardened(account)
    .derive(change)
}
