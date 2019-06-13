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

  return generateWalletForCoinType(derivedChainKey, coinType, index)
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

// NOTE: We can split this out later when there are more wallets needs to be derived.
function generateWalletForCoinType(key: bip32.BIP32Interface, coinType: CoinType, index: number): Wallet {
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
      return {
        address: EthUtil.pubToAddress(key.publicKey, true).toString('hex'),
        index,
        privateKey: key.privateKey.toString('hex'),
        publicKey: key.publicKey.toString('hex')
      }
    default:
      throw new Error(`invalid coin type ${coinType} for generating a wallet`)
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
