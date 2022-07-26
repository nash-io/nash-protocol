import { Wallet, Config, InitParams } from '../types'
import decryptSecretKey from '../decryptSecretKey'
import secretKeyToMnemonic from '../secretKeyToMnemonic'
import mnemonicToMasterSeed from '../mnemonicToMasterSeed'
import {
  generateNashPayloadSigningKey,
  generateWallet,
  coinTypeFromString,
  blockchainFromString
} from '../generateWallet'
// import { cryptoWaitReady } from '@polkadot/util-crypto'

// initialize takes in the init parameters and returns a Config object with all the
// derived keys.
export default async function initialize(params: InitParams): Promise<Config> {
  const secretKey = await decryptSecretKey(params.encryptionKey, params.aead)
  const masterSeed = mnemonicToMasterSeed(secretKeyToMnemonic(secretKey))

  const wallets: Record<string, Wallet> = {}
  for (const [name, index] of Object.entries(params.walletIndices)) {
    // We do not want to initialized polkadotjs unless necessary
    // if (name.toLowerCase() === 'dot') {
    //   await cryptoWaitReady()
    // }
    wallets[name] = generateWallet(masterSeed, coinTypeFromString(name), index, params.net, blockchainFromString(name))
  }

  const payloadSigningKey = generateNashPayloadSigningKey(masterSeed, 1)
  if (payloadSigningKey.privateKey === undefined) {
    throw new Error('nash private is undefined')
  }

  return {
    assetData: params.assetData!,
    marketData: params.marketData!,
    payloadSigningKey,
    wallets
  }
}
