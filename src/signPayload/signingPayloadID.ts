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
  placeStopMarkerOrderPayload = 11,
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
  [SigningPayloadID.getOrderPayload]: 'get_account_order'
}

export function canSignKind(kind: SigningPayloadID): boolean {
  return kind < SigningPayloadID.getOrderPayload
}

export function kindToName(kind: SigningPayloadID): string {
  const name = PayloadIDToName[kind]

  if (name == null) {
    throw new Error(
      `Cannot use nex-auth-protocol to get name with kind ${kind}`
    )
  }

  return PayloadIDToName[kind] as string
}
