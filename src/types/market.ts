/**
 * Represents a market on the Nash Exchange.
 *
 * Generally, this is consumed in the form of `Record<string, Market>` where
 * `string` represents the market's name. This interface represents the
 * absolute minimum of properties needed for the Nash Protocol to function.
 */
export default interface Market {
  /**
   * Represents the smallest increment by which an order size can increase in
   * the given market.
   *
   * For example, if `minTickSize` is `0.1`, all trades must be sized in
   * increments of `0.1`.
   */
  readonly minTickSize: number
  /**
   * Represents the lowest price an order can have in the given market.
   */
  readonly minTradeSize: number
  /**
   * Represents the smallest increment by which an order price can increase for
   * the given market's `aUnit`, or base currency.
   */
  readonly minTradeIncrementA: number
  /**
   * Represents the smallest increment by which an order price can increase for
   * the given market's `bUnit`, or quote currency.
   */
  readonly minTradeIncrementB: number
}
