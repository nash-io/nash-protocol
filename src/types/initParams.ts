import { Asset, Market, AEAD } from '../types'

export default interface InitParams {
  encryptionKey: Buffer
  aead: AEAD
  walletIndices: { readonly [key: string]: number }
  assetData?: { readonly [key: string]: Asset }
  marketData?: { readonly [key: string]: Market }
  net?: 'MainNet' | 'TestNet' | 'LocalNet'
}
