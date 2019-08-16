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
}

export interface AddMovementPayload {
  recycled_orders?: ClientSignedState[]
}

export interface AddMovementRequestPayload {
  resigned_orders: ClientSignedState[]
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
  cancelAt?: string,
  nonceFrom?: number,
  nonceOrder?: number,
  nonceTo?: number
): PayloadAndKind {
  const payload = {
    allow_taker: allowTaker,
    amount,
    buy_or_sell: buyOrSell,
    cancel_at: cancelAt,
    cancellation_policy: cancellationPolicy,
    limit_price: snakeCase(limitPrice),
    market_name: marketName,
    nonce_from: nonceFrom || createTimestamp32(),
    nonce_order: nonceOrder || createTimestamp32(),
    nonce_to: nonceTo || createTimestamp32(),
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
  cancelAt?: string,
  nonceFrom?: number,
  nonceOrder?: number,
  nonceTo?: number
): PayloadAndKind {
  const payload = {
    allow_taker: allowTaker,
    amount,
    buy_or_sell: buyOrSell,
    cancel_at: cancelAt,
    cancellation_policy: cancellationPolicy,
    limit_price: snakeCase(limitPrice),
    market_name: marketName,
    nonce_from: nonceFrom || createTimestamp32(),
    nonce_order: nonceOrder || createTimestamp32(),
    nonce_to: nonceTo || createTimestamp32(),
    stop_price: snakeCase(stopPrice),
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
  nonceFrom?: number,
  nonceOrder?: number,
  nonceTo?: number
): PayloadAndKind {
  const payload = {
    amount,
    buy_or_sell: buyOrSell,
    market_name: marketName,
    nonce_from: nonceFrom || createTimestamp32(),
    nonce_order: nonceOrder || createTimestamp32(),
    nonce_to: nonceTo || createTimestamp32(),
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
  nonceFrom?: number,
  nonceOrder?: number,
  nonceTo?: number
): PayloadAndKind {
  const payload = {
    amount,
    buy_or_sell: buyOrSell,
    market_name: marketName,
    nonce_from: nonceFrom || createTimestamp32(),
    nonce_order: nonceOrder || createTimestamp32(),
    nonce_to: nonceTo || createTimestamp32(),
    stop_price: snakeCase(stopPrice),
    timestamp: createTimestamp()
  }

  return {
    kind: SigningPayloadID.placeStopMarketOrderPayload,
    payload
  }
}

export function createAddMovementParams(
  address: string,
  quantity: object,
  type: string,
  nonce?: number,
  timestamp?: number
): PayloadAndKind {
  const payload = {
    address,
    nonce: nonce || createTimestamp32(),
    quantity,
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
