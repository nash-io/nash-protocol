/**
 * Represents an asset on the Nash Exchange.
 *
 * Generally, this is consumed in the form of `Record<string, Asset>` where
 * `string` represents the asset's name. This interface represents the
 * absolute minimum of properties needed for the Nash Protocol to function.
 */
export default interface Asset {
  /**
   * Represents the chain this asset uses, such as NEO or ETH.
   */
  readonly blockchain: string
  readonly hash: string
  readonly precision: number
}
