import * as bip32 from 'bip32'
import { Wallet } from '../types'
import Neon from '@cityofzion/neon-js'
import * as EthUtil from 'ethereumjs-util'

const bip44Purpose = 44
const nashPurpose = 1337

export enum CoinType {
  BTC = 0,
  ETH = 60,
  NEO = 888
}

export function generateWallet(masterSeed: Buffer, coinType: CoinType, index: number): Wallet {
  const key = derivePath(masterSeed, bip44Purpose, coinType, 0, 0)
  const derivedChainKey = deriveIndex(key, index)

  if (derivedChainKey.privateKey === undefined) {
    throw new Error('private key is not properly generated')
  }

  return {
    address: getAddressFromCoinType(derivedChainKey.publicKey, coinType),
    index,
    privateKey: derivedChainKey.privateKey.toString('hex').toLowerCase(),
    publicKey: derivedChainKey.publicKey.toString('hex').toLowerCase()
  }
}

export function generateNashPayloadSigningKey(masterSeed: Buffer, index: number): Wallet {
  const extendedKey = derivePath(masterSeed, nashPurpose, 0, 0, 0)
  const key = deriveIndex(extendedKey, index)

  if (key.privateKey === undefined) {
    throw new Error('private key is not properly generated')
  }

  return {
    address: '',
    index,
    privateKey: key.privateKey.toString('hex').toLowerCase(),
    publicKey: key.publicKey.toString('hex').toLowerCase()
  }
}

// Generates a deterministic key according to the BIP44 spec.
// M' / purpose' / coin' / account' / change / index
// M' / 44' / coin' / 0' / 0
export function generateBIP44Key(masterSeed: Buffer, coinType: CoinType, index: number): bip32.BIP32Interface {
  const extendedKey = derivePath(masterSeed, bip44Purpose, coinType, 0, 0)
  const chainKey = deriveIndex(extendedKey, index)

  return chainKey
}

// Derives a new key from the extended key for the given index.
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

function getAddressFromCoinType(publicKey: Buffer, coinType: CoinType): string {
  switch (coinType) {
    case CoinType.NEO:
      return Neon.create.account(publicKey.toString('hex').slice(2)).address
    case CoinType.ETH:
      return EthUtil.pubToAddress(publicKey, true).toString('hex')
    default:
      throw new Error(`invalid coin type given ${coinType}`)
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
