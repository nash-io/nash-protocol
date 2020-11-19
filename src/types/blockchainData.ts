import BigNumber from 'bignumber.js'

/**
 * @TODO Add documentation.
 */
export default interface BlockchainData {
  readonly amount: string
  readonly amountFlipped: boolean
  readonly marketName: string
  readonly buyOrSell: string
  readonly nonce: number
  readonly nonceOrder: number
  readonly noncesFrom: number[]
  readonly noncesTo: number[]
  readonly limitPrice: BigNumber
}

/**
 * @TODO Add documentation.
 */
export interface ChainNoncePair {
  chain: string
  nonceFrom: number
  nonceTo: number
}
