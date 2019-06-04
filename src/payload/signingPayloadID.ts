// This is currently the same as api-client-ts/constants/PayloadID
export enum SigningPayloadID {
  listOrderPayload = 0,
  cancelOrderPayload = 1,
  listAccountBalancePayload = 2,
  listAccountVolumesPayload = 3,
  listMovementsPayload = 4,
  getAccountBalancePayload = 5,
  getDepositAddressPayload = 6,
  getMovementPayload = 7,
  getOrderPayload = 8,
  // the below are operations which require blockchain information
  // and not currently implemented
  placeLimitOrderPayload = 9,
  placeStopLimitOrderPayload = 10,
  placeStopMarketOrderPayload = 11,
  placeMarketOrderPayload = 12,
  signMovementPayload = 13,
  syncStatePayload = 14,
  depositRequestPayload = 15,
  withdrawRequestPayload = 16
}

export const PayloadIDToName: Partial<Record<SigningPayloadID, string>> = {
  [SigningPayloadID.listOrderPayload]: 'list_account_orders',
  [SigningPayloadID.cancelOrderPayload]: 'cancel_order',
  [SigningPayloadID.listAccountBalancePayload]: 'list_account_balances',
  [SigningPayloadID.listAccountVolumesPayload]: 'list_account_volumes',
  [SigningPayloadID.listMovementsPayload]: 'list_movements',
  [SigningPayloadID.getAccountBalancePayload]: 'get_account_balance',
  [SigningPayloadID.getDepositAddressPayload]: 'get_deposit_address',
  [SigningPayloadID.getMovementPayload]: 'get_movement',
  [SigningPayloadID.getOrderPayload]: 'get_account_order',
  [SigningPayloadID.placeLimitOrderPayload]: 'place_limit_order',
  [SigningPayloadID.placeStopLimitOrderPayload]: 'place_stop_limit_order',
  [SigningPayloadID.placeStopMarketOrderPayload]: 'place_stop_market_order',
  [SigningPayloadID.placeMarketOrderPayload]: 'place_market_order',
  [SigningPayloadID.signMovementPayload]: 'sign_movement',
  [SigningPayloadID.syncStatePayload]: 'sync_state',
  [SigningPayloadID.depositRequestPayload]: 'deposit_request',
  [SigningPayloadID.withdrawRequestPayload]: 'whithdraw_request'
}

export function kindToName(kind: SigningPayloadID): string {
  const name = PayloadIDToName[kind]

  if (name == null) {
    throw new Error(`Cannot use nex-auth-protocol to get name with kind ${kind}`)
  }

  return PayloadIDToName[kind] as string
}

export function needBlockchainSignature(kind: SigningPayloadID): boolean {
  return kind > SigningPayloadID.getOrderPayload
}

export function needBlockchainMovement(kind: SigningPayloadID): boolean {
  return kind > SigningPayloadID.syncStatePayload
}

export function isOrderPayload(kind: SigningPayloadID): boolean {
  return kind > SigningPayloadID.getOrderPayload && kind < SigningPayloadID.signMovementPayload
}

export function isLimitOrderPayload(kind: SigningPayloadID): boolean {
  return kind === SigningPayloadID.placeLimitOrderPayload || kind === SigningPayloadID.placeStopLimitOrderPayload
}

// Returns the prefix for the blockchain data based on the id of the payload.
export function kindToOrderPrefix(kind: SigningPayloadID): string {
  if (kind === SigningPayloadID.syncStatePayload) {
    return '00'
  }
  if (isOrderPayload(kind)) {
    return '01'
  }
  if (kind === SigningPayloadID.depositRequestPayload) {
    return '02'
  }
  if (kind === SigningPayloadID.withdrawRequestPayload) {
    return '03'
  }

  throw new Error(`invalid kind given ${kindToName(kind)}`)
}
