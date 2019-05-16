export default interface Market {
  readonly aUnit: string
  readonly aUnitPrecision: number
  readonly bUnit: string
  readonly bUnitPrecision: number
  readonly minTickSize: string
  readonly minTradeSize: string
  readonly name: string
  readonly status: string
}
