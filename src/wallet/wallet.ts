import * as bip32 from 'bip32'
import { BIP32Interface } from 'bip32'
import { Wallet } from '../types'

const purpose = 44
const nashPurpose = 1337

export enum CoinType {
  BTC = 0,
  ETH = 60,
  NEO = 888
}

export function generateWallet(masterSeed: Buffer, coinType: CoinType, index: number): Wallet {
  const key = generateBIP44Key(masterSeed, coinType, index)

  if (key.privateKey === undefined) {
    throw new Error('private key is not properly generated')
  }

  return {
    publicKey: key.publicKey.toString('hex'),
    privateKey: key.privateKey.toString('hex'),
    address: getAddressFromCoinType(coinType),
    index: index
  }
}

export function generateNashPayloadSigningKey(masterSeed: Buffer, index: number): BIP32Interface {
  const extendedKey = derivePath(masterSeed, nashPurpose, 0, 0, 0)
  return deriveIndex(extendedKey, index)
}

// Generates a deterministic key according to the BIP44 spec.
// M' / purpose' / coin' / account' / change / index
// M' / 44' / coin' / 0' / 0
export function generateBIP44Key(masterSeed: Buffer, coinType: CoinType, index: number): BIP32Interface {
  const extendedKey = derivePath(masterSeed, purpose, coinType, 0, 0)

  console.log(extendedKey.toBase58())
  const chainKey = deriveIndex(extendedKey, index)

  return chainKey
}

// Derives a new key from the extended key for the given index.
export function deriveIndex(extendedKey: BIP32Interface, index: number): BIP32Interface {
  return extendedKey.derive(index)
}

function derivePath(
  masterSeed: Buffer,
  purpose: number,
  coinType: CoinType,
  account: number,
  change: number
): BIP32Interface {
  const masterKey = bip32.fromSeed(masterSeed)
  return masterKey
    .deriveHardened(purpose)
    .deriveHardened(coinType)
    .deriveHardened(account)
    .derive(change)
}

function getAddressFromCoinType(coinType: CoinType): string {
  console.log(coinType)
  return 'dd'
}
