import { Config, Asset, Market, AEAD, Wallet } from '../types'
import decryptSecretKey from '../decryptSecretKey'
import secretKeyToMnemonic from '../secretKeyToMnemonic'
import mnemonicToMasterSeed from '../mnemonicToMasterSeed'
import { generateWallet, coinTypeFromString } from '../generateWallet'

export interface InitParams {
  encryptionKey: Buffer
  aead: AEAD
  walletConfig: Record<string, number>
  assetData: { readonly [key: string]: Asset }
  marketData: { readonly [key: string]: Market }
}

// initialize takes in the init parameters and returns a Config object.
export async function initialize(params: InitParams): Promise<Config> {
  const secretKey = await decryptSecretKey(params.encryptionKey, params.aead)
  const masterSeed = mnemonicToMasterSeed(secretKeyToMnemonic(secretKey))

  let wallets: { [key: string]: Wallet } = {}
  Object.keys(params.walletConfig).forEach((k: string) => {
    const index = params.walletConfig[k]
    const wallet = generateWallet(masterSeed, coinTypeFromString(k), index)
    wallets[k] = wallet
  })

  return {
    assetData: params.assetData,
    marketData: params.marketData,
    wallets
  }
}
