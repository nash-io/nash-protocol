import { Config, Asset, Market, AEAD, Wallet } from '../types'
import decryptSecretKey from '../decryptSecretKey'
import secretKeyToMnemonic from '../secretKeyToMnemonic'
import mnemonicToMasterSeed from '../mnemonicToMasterSeed'
import { generateNashPayloadSigningKey, generateWallet, coinTypeFromString } from '../generateWallet'

export interface InitParams {
  encryptionKey: Buffer
  aead: AEAD
  walletConfig: Record<string, number>
  assetData: { readonly [key: string]: Asset }
  marketData: { readonly [key: string]: Market }
}

// initialize takes in the init parameters and returns a Config object with all the
// derived keys.
export async function initialize(params: InitParams): Promise<Config> {
  const secretKey = await decryptSecretKey(params.encryptionKey, params.aead)
  const masterSeed = mnemonicToMasterSeed(secretKeyToMnemonic(secretKey))

  const wallets: { [key: string]: Wallet } = {}
  Object.keys(params.walletConfig).forEach((k: string) => {
    const index = params.walletConfig[k]
    const wallet = generateWallet(masterSeed, coinTypeFromString(k), index)
    wallets[k] = wallet
  })

  const nashSigningKey = generateNashPayloadSigningKey(masterSeed, 1)
  if (nashSigningKey.privateKey === undefined) {
    throw new Error('nash private key not generated')
  }

  return {
    assetData: params.assetData,
    marketData: params.marketData,
    payloadSigningKey: {
      address: '_',
      index: 1,
      privateKey: nashSigningKey.privateKey.toString('hex'),
      publicKey: nashSigningKey.publicKey.toString('hex')
    },
    wallets
  }
}
