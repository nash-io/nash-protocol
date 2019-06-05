import Market from './market'
import Asset from './asset'
import Wallet from './wallet'

export default interface Config {
  readonly assetData: { readonly [key: string]: Asset }
  readonly marketData: { readonly [key: string]: Market }
  readonly wallets: { readonly [key: string]: Wallet }
  readonly payloadSigningKey: Wallet
}
