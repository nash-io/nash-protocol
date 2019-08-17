export default interface BlockchainData {
  readonly amount: string
  readonly marketName: string
  readonly buyOrSell: string
  readonly nonce: number
  readonly nonceFrom: number
  readonly nonceTo: number
  readonly nonceOrder: number
  readonly limitPrice: string
}
