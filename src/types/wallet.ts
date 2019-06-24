export default interface Wallet {
  readonly address: string
  readonly privateKey: string
  readonly publicKey: string
  readonly index: number
}
