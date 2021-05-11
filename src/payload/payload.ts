import { PayloadAndKind } from './payloadAndKind'
import { SigningPayloadID } from './signingPayloadID'
import { createTimestamp32, createTimestamp } from '../utils/createTimestamp'
import snakeCase from '../utils/snakecase'

export interface SyncState {
  blockchain: string
  message: string
}

export interface SignedState extends SyncState {
  signature: string
}

export const MovementTypeDeposit = 'DEPOSIT'
export const MovementTypeWithdrawal = 'WITHDRAWAL'
// This is used for personal -> external
export const MovementTypeTransfer = 'TRANSFER'

export const BuyOrSellBuy = 'BUY'
export const BuyOrSellSell = 'SELL'

export const HASH_SHA256 = 'SHA256'
export const HASH_DOUBLE_SHA256 = 'DOUBLE_SHA256'
export const HASH_DOUBLESHA256 = 'DOUBLESHA256'
export const HASH_NONE = 'NOHASH'

export interface SignStatesPayload {
  timestamp: number
  states: ClientSignedState[]
  recycled_orders: ClientSignedState[]
}

export interface SignStatesRequestPayload {
  timestamp: number
  client_signed_states: ClientSignedState[]
  signed_recycled_orders: ClientSignedState[]
}

export interface ClientSignedState {
  blockchain: string
  message: string
  signature?: string
  r?: string
}

export interface TransactionDigest {
  digest: string
  blockchain: string
  payload: string
  payloadHash: string
  payloadHashFunction: string
  signatureFunction: string
}

export interface AddMovementPayload {
  digests?: TransactionDigest[]
  recycled_orders?: ClientSignedState[]
  backendGeneratedPayload?: boolean
}

export interface AddMovementRequestPayload {
  resigned_orders: ClientSignedState[]
  signed_transaction_elements: ClientSignedState[]
}

/**
 *
 * @param before
 * @param buyOrSell
 * @param limit
 * @param marketName
 * @param rangeStart
 * @param rangeStop
 * @param status
 * @param type
 */
export function createListAccountOrdersParams(
  before?: string,
  buyOrSell?: string,
  limit?: number,
  marketName?: string,
  rangeStart?: string,
  rangeStop?: string,
  status?: [string],
  type?: [string]
): PayloadAndKind {
  const payload = {
    before,
    buy_or_sell: buyOrSell,
    limit,
    market_name: marketName,
    range_start: rangeStart,
    range_stop: rangeStop,
    status,
    timestamp: createTimestamp(),
    type
  }

  return {
    kind: SigningPayloadID.listOrderPayload,
    payload
  }
}

/**
 *
 * @param before
 * @param limit
 * @param marketName
 */
export function createListAccountTradesParams(before?: string, limit?: number, marketName?: string): PayloadAndKind {
  const payload = {
    before,
    limit,
    market_name: marketName,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.listTradePayload,
    payload
  }
}

export function createCancelOrderParams(id: string, marketName: string): PayloadAndKind {
  const payload = {
    marketName,
    orderId: id,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.cancelOrderPayload,
    payload
  }
}

export function createListAccountBalanceParams(ignoreLowBalance: boolean = false): PayloadAndKind {
  const payload = {
    ignoreLowBalance,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.listAccountBalancePayload,
    payload
  }
}

export function createGetAccountVolumesParams(): PayloadAndKind {
  const payload = {
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.getAccountVolumesPayload,
    payload
  }
}

export function createListAccountTransactionsParams(
  cursor?: string,
  fiatSymbol?: string,
  limit?: number
): PayloadAndKind {
  const payload = {
    cursor,
    fiat_symbol: fiatSymbol,
    limit,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.listAccountTransactionsPayload,
    payload
  }
}

export function createListMovementsParams(currency?: string, status?: string, type?: string): PayloadAndKind {
  const payload = {
    currency,
    status,
    timestamp: createTimestamp(),
    type
  }

  return {
    kind: SigningPayloadID.listMovementsPayload,
    payload
  }
}

export function createGetAccountBalanceParams(currency: string): PayloadAndKind {
  const payload = {
    currency,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.getAccountBalancePayload,
    payload
  }
}

export function createGetDepositAddressParams(currency: string): PayloadAndKind {
  const payload = {
    currency,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.getDepositAddressPayload,
    payload
  }
}

export function createGetMovementParams(id: number): PayloadAndKind {
  const payload = {
    movement_id: id,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.getMovementPayload,
    payload
  }
}

export function createGetAccountOrderParams(id: string): PayloadAndKind {
  const payload = {
    order_id: id,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.getOrderPayload,
    payload
  }
}

export function createPlaceLimitOrderParams(
  allowTaker: boolean,
  amount: object,
  buyOrSell: string,
  cancellationPolicy: string,
  limitPrice: object,
  marketName: string,
  noncesFrom: number[],
  noncesTo: number[],
  nonceOrder?: number,
  cancelAt?: string
): PayloadAndKind {
  const payload = {
    allowTaker,
    amount,
    buyOrSell,
    cancelAt,
    cancellationPolicy,
    limitPrice: snakeCase(limitPrice),
    marketName,
    nonceOrder: nonceOrder || createTimestamp32(),
    noncesFrom,
    noncesTo,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.placeLimitOrderPayload,
    payload
  }
}

export function createPlaceStopLimitOrderParams(
  allowTaker: boolean,
  amount: object,
  buyOrSell: string,
  cancellationPolicy: string,
  limitPrice: object,
  marketName: string,
  stopPrice: object,
  noncesFrom: number[],
  noncesTo: number[],
  nonceOrder?: number,
  cancelAt?: string
): PayloadAndKind {
  const payload = {
    allowTaker,
    amount,
    buyOrSell,
    cancelAt,
    cancellationPolicy,
    limitPrice: snakeCase(limitPrice),
    marketName,
    nonceOrder: nonceOrder || createTimestamp32(),
    noncesFrom,
    noncesTo,
    stopPrice: snakeCase(stopPrice),
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.placeStopLimitOrderPayload,
    payload
  }
}

export function createPlaceMarketOrderParams(
  amount: object,
  buyOrSell: string,
  marketName: string,
  noncesFrom: number[],
  noncesTo: number[],
  nonceOrder?: number
): PayloadAndKind {
  const payload = {
    amount,
    buyOrSell,
    marketName,
    nonceOrder: nonceOrder || createTimestamp32(),
    noncesFrom,
    noncesTo,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.placeMarketOrderPayload,
    payload
  }
}

export function createPlaceStopMarketOrderParams(
  amount: object,
  buyOrSell: string,
  marketName: string,
  stopPrice: object,
  noncesFrom: number[],
  noncesTo: number[],
  nonceOrder?: number
): PayloadAndKind {
  const payload = {
    amount,
    buyOrSell,
    marketName,
    nonceOrder: nonceOrder || createTimestamp32(),
    noncesFrom,
    noncesTo,
    stopPrice: snakeCase(stopPrice),
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.placeStopMarketOrderPayload,
    payload
  }
}

export function createPrepareMovementParams(
  address: string,
  backendGeneratedPayload: boolean,
  quantity: object,
  type: string,
  timestamp?: number,
  targetAddress?: string,
  capQuantityToMaximum?: boolean,
  gasPrice?: number
): PayloadAndKind {
  const payload = {
    address,
    backendGeneratedPayload,
    capQuantityToMaximum: capQuantityToMaximum ? capQuantityToMaximum : false,
    gasPrice,
    quantity,
    targetAddress,
    timestamp: timestamp || createTimestamp(),
    type
  }
  return {
    kind: SigningPayloadID.prepareMovementPayload,
    payload
  }
}

export function createAddMovementParams(
  address: string,
  backendGeneratedPayload: boolean,
  quantity: object,
  type: string,
  nonce: number,
  timestamp?: number,
  recycledOrders?: ClientSignedState[],
  digests?: TransactionDigest[]
): PayloadAndKind {
  const payload = {
    address,
    backendGeneratedPayload,
    digests: digests || [],
    nonce,
    quantity,
    recycled_orders: recycledOrders || [],
    timestamp: timestamp || createTimestamp(),
    type
  }

  return {
    kind: SigningPayloadID.addMovementPayload,
    payload
  }
}

export function createSyncStatesParams(syncStateList: SyncState[]): PayloadAndKind {
  const payload = {
    server_signed_states: syncStateList,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.syncStatePayload,
    payload
  }
}

export function createGetStatesParams(): PayloadAndKind {
  const payload = {
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.getStatesPayload,
    payload
  }
}

export function createSignStatesParams(states: SyncState[], recycledOrders: SyncState[]): PayloadAndKind {
  const payload = {
    recycled_orders: recycledOrders,
    states,
    timestamp: createTimestamp()
  }
  return {
    kind: SigningPayloadID.signStatesPayload,
    payload
  }
}

export function createAccountPortfolioParams(fiatSymbol?: string, period?: string): PayloadAndKind {
  const payload = {
    fiat_symbol: fiatSymbol,
    period,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.getAccountPortfolioPayload,
    payload
  }
}

export function createGetOrdersForMovementParams(unit: string): PayloadAndKind {
  const payload = {
    timestamp: createTimestamp(),
    unit
  }

  return {
    kind: SigningPayloadID.getOrdersForMovementPayload,
    payload
  }
}

export function createGetAssetsNoncesParams(assets: string[]): PayloadAndKind {
  const payload = {
    assets,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.getAssetsNoncesPayload,
    payload
  }
}

export function createGetAccountAddressParams(currency: string): PayloadAndKind {
  const payload = {
    currency,
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.getAccountAddressPayload,
    payload
  }
}

export function createSendBlockchainRawTransactionParams(
  blockchain: string,
  transactionPayload: string
): PayloadAndKind {
  const payload = {
    blockchain,
    timestamp: createTimestamp(),
    transactionPayload
  }

  return {
    kind: SigningPayloadID.sendBlockchainRawTransactionPayload,
    payload
  }
}
