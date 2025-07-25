import * as bip32 from 'bip32'
import { Blockchain, Wallet } from '../types'
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
import nacl from 'tweetnacl'

const curve = new EC('p256')
const bip44Purpose = 44
const nashPurpose = 1337

// This BIP 44 coin types are used to define contsants for wallet derivation.  They are based on the
// document here https://github.com/satoshilabs/slips/blob/master/slip-0044.md
// In the cases where no constant is found in that document, we utilize the constants defined
// by trust wallet here: https://github.com/trustwallet/wallet-core/blob/master/docs/registry.md

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
  NEO3 = 888,
  NEO_X = 1668,
  POLYGON = 966,
  AVAXC = 9000,
  ABRITRUM = 9001,
  BNB = 714,
  BASE = 8453,
  MANTLE = 5000,
  OPTIMISM = 10000070,
  SOLANA = 501
}

const NON_SEGWIT = [CoinType.BCH, CoinType.DOGE]

/**
 * Creates a wallet for a given token via the
 * [BIP-44 protocol]((https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki).
 *
 * Requires the user's master seed.
 */
export function generateWallet(
  masterSeed: Buffer,
  coinType: CoinType,
  index: number,
  net?: string,
  blockchain?: Blockchain
): Promise<Wallet> {
  let coinTypeToUseForWalletPathDerivation: CoinType = coinType
  // legacy wallets used 1 as an index, which while not incorrect is not what most BIP44 implementations do
  // going forward we will use 0 instead.
  // however, the value of 0 can give us an idea that we want to use the
  // same address for all EVM wallets on non-legacy accounts
  // So if the index is 0, we will derive the path to always be the ETH coin type wallet for EVM wallets
  // otherwise use non eth ( MATIC, ARBITRUM, etc ) coin type

  if (index === 0 && isEVM(coinType)) {
    coinTypeToUseForWalletPathDerivation = CoinType.ETH
  }

  const key = derivePath(masterSeed, bip44Purpose, coinTypeToUseForWalletPathDerivation, 0, 0)
  const derivedChainKey = deriveIndex(key, index)

  return generateWalletForCoinType(derivedChainKey, coinType, index, net, blockchain)
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
    arbitrum: CoinType.ABRITRUM,
    avaxc: CoinType.AVAXC,
    base: CoinType.BASE,
    bch: CoinType.BCH,
    bnb: CoinType.BNB,
    btc: CoinType.BTC,
    doge: CoinType.DOGE,
    dot: CoinType.DOT,
    erd: CoinType.ERD,
    etc: CoinType.ETC,
    eth: CoinType.ETH,
    ltc: CoinType.LTC,
    mantle: CoinType.MANTLE,
    neo: CoinType.NEO,
    neo3: CoinType.NEO3,
    neo_x: CoinType.NEO_X,
    neox: CoinType.NEO_X,
    optimism: CoinType.OPTIMISM,
    polygon: CoinType.POLYGON,
    solana: CoinType.SOLANA
  }

  if (!(s in m)) {
    throw new Error(`invalid name ${s} given to convert to a valid coin type`)
  }

  return m[s]
}

export const blockchainFromString = (name: string): Blockchain => {
  switch (name) {
    case 'btc':
      return Blockchain.BTC
    case 'eth':
      return Blockchain.ETH
    case 'neo':
      return Blockchain.NEO
    case 'avaxc':
      return Blockchain.AVAXC
    case 'polygon':
      return Blockchain.POLYGON
    case 'neo3':
      return Blockchain.NEO3
    case 'neox':
    case 'neo_x':
      return Blockchain.NEO_X
    case 'arbitrum':
      return Blockchain.ARBITRUM
    case 'bnb':
      return Blockchain.BNB
    case 'base':
      return Blockchain.BASE
    case 'mantle':
      return Blockchain.MANTLE
    case 'optimism':
      return Blockchain.OPTIMISM
    case 'solana':
      return Blockchain.SOLANA
    default:
      throw new Error('Unsupported name')
  }
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

const getVerificationScriptFromPublicKey = (publicKey: string, blockchain?: Blockchain): string => {
  if (blockchain && blockchain === Blockchain.NEO3) {
    return '0c21' + publicKey + '4156e7b327'
  }
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
const NEO3_ADDR_VERSION = '35'

export const getAddressFromScriptHash = (scriptHash: string, addressVersion: string): string => {
  const scriptHashReversed = reverseHex(scriptHash)
  const shaChecksum = hash256(addressVersion + scriptHashReversed).substr(0, 8)
  return base58.encode(Buffer.from(addressVersion + scriptHashReversed + shaChecksum, 'hex'))
}

// NOTE: We can split this out later when there are more wallets needs to be derived.
async function generateWalletForCoinType(
  key: bip32.BIP32Interface,
  coinType: CoinType,
  index: number,
  net?: string,
  blockchain?: Blockchain
): Promise<Wallet> {
  if (key.privateKey === undefined) {
    throw new Error('private key not properly derived')
  }
  switch (coinType) {
    case CoinType.NEO:
      const neoPrivKey = key.privateKey.toString('hex')
      const publicKey = neoGetPublicKeyFromPrivateKey(neoPrivKey)
      const verifiedScript = getVerificationScriptFromPublicKey(publicKey, blockchain)
      const scriptHash = reverseHex(hash160(verifiedScript))
      const addressVersion = blockchain && blockchain === Blockchain.NEO3 ? NEO3_ADDR_VERSION : ADDR_VERSION
      return {
        address: getAddressFromScriptHash(scriptHash, addressVersion),
        index,
        privateKey: neoPrivKey,
        publicKey
      }
    case CoinType.ETH:
    case CoinType.ETC:
    case CoinType.AVAXC:
    case CoinType.POLYGON:
    case CoinType.ABRITRUM:
    case CoinType.NEO_X:
    case CoinType.BNB:
    case CoinType.BASE:
    case CoinType.OPTIMISM:
    case CoinType.MANTLE:
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
    case CoinType.SOLANA:
      const solanaKeypair = nacl.sign.keyPair.fromSeed(new Uint8Array(key.privateKey))
      const solanaPubkey = Buffer.from(solanaKeypair.publicKey).toString('hex')
      const solanaAddress = base58.encode(solanaKeypair.publicKey)
      return {
        address: solanaAddress,
        index,
        privateKey: key.privateKey.toString('hex'),
        publicKey: solanaPubkey
      }
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

const isEVM = (coinType: CoinType): boolean => {
  switch (coinType) {
    case CoinType.ETH:
    case CoinType.ETC:
    case CoinType.AVAXC:
    case CoinType.POLYGON:
    case CoinType.ABRITRUM:
    case CoinType.NEO_X:
    case CoinType.BNB:
    case CoinType.BASE:
    case CoinType.OPTIMISM:
    case CoinType.MANTLE:
      return true
  }
  return false
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
