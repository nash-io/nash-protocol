// Wallet holds information about a blockchain private key.
export interface Wallet {
  readonly address: string
  readonly privateKey: string
  readonly publicKey: string
}
