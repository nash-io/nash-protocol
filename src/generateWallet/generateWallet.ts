import * as bip32 from 'bip32'
import { Wallet } from '../types'
import Neon from '@cityofzion/neon-js'
import * as EthUtil from 'ethereumjs-util'
import * as Bitcoin from 'bitcoinjs-lib'
import * as tiny from 'tiny-secp256k1'

const bip44Purpose = 44
const nashPurpose = 1337

export enum CoinType {
  BTC = 0,
  ETH = 60,
  NEO = 888
}

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
    btc: CoinType.BTC,
    eth: CoinType.ETH,
    neo: CoinType.NEO
  }

  if (!(s in m)) {
    throw new Error(`invalid name ${s} given to convert to a valid coin type`)
  }

  return m[s]
}

// NOTE: We can split this out later when there are more wallets needs to be derived.
function generateWalletForCoinType(key: bip32.BIP32Interface, coinType: CoinType, index: number, net?: string): Wallet {
  if (key.privateKey === undefined) {
    throw new Error('private key not properly derived')
  }

  switch (coinType) {
    case CoinType.NEO:
      const account = Neon.create.account(key.privateKey.toString('hex'))
      return {
        address: account.address,
        index,
        privateKey: key.privateKey.toString('hex'),
        publicKey: account.publicKey
      }
    case CoinType.ETH:
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
      return {
        address: bitcoinAddressFromPublicKey(key.publicKey, net!),
        index,
        privateKey: key.privateKey.toString('hex'),
        publicKey: key.publicKey.toString('hex')
      }
    default:
      throw new Error(`invalid coin type ${coinType} for generating a wallet`)
  }
}

const bitcoinAddressFromPublicKey = (publicKey: Buffer, net: string): string => {
  return Bitcoin.payments.p2pkh({ network: bitcoinNetworkFromString(net), pubkey: publicKey }).address!
}

const bitcoinNetworkFromString = (net: string | undefined): Bitcoin.Network => {
  switch (net) {
    case 'MainNet':
      return Bitcoin.networks.bitcoin
    case 'TestNet':
      return Bitcoin.networks.testnet
    case 'LocalNet':
      return Bitcoin.networks.testnet
    default:
      return Bitcoin.networks.bitcoin
  }
}

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
