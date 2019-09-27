export default interface Market {
  readonly minTickSize: number
  readonly minTradeSize: number
  readonly minTradeIncrementA: number
  readonly minTradeIncrementB: number
}
