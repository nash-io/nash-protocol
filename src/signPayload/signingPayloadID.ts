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
  // and not currently implemented excluding 14, 20 for syncingStates
  placeLimitOrderPayload = 9,
  placeStopLimitOrderPayload = 10,
  placeStopMarkerOrderPayload = 11,
  placeMarketOrderPayload = 12,
  addMovementPayload = 13,
  // excluded
  syncStatesPayload = 14,
  depositRequestPayload = 15,
  withdrawRequestPayload = 16,
  cancelAllOrdersPayload = 17,
  listAccountTransactionsPayload = 18,
  getAccountPortfolioPayload = 19,
  // excluded
  getStatesPayload = 20,
  signStatesPayload = 21,
  // excluded
  updateMovementPayload = 22,
  listAccountStakesPayload = 23,
  // excluded
  listAccountStakingStatementsPayload = 24,
  listAccountStakingDividendsPayload = 25,
  // excluded
  getOrdersForMovementPayload = 26,
  // excluded
  getAssetsNoncesPayload = 27
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
  [SigningPayloadID.getStatesPayload]: 'get_states',
  [SigningPayloadID.syncStatesPayload]: 'sync_states',
  [SigningPayloadID.updateMovementPayload]: 'update_movement',
  [SigningPayloadID.addMovementPayload]: 'add_movement',
  [SigningPayloadID.listAccountStakesPayload]: 'list_account_stakes',
  [SigningPayloadID.listAccountStakingStatementsPayload]:
    'list_account_staking_statements',
  [SigningPayloadID.listAccountStakingDividendsPayload]:
    'list_account_staking_dividends',
  [SigningPayloadID.getOrdersForMovementPayload]: 'get_orders_for_movement',
  [SigningPayloadID.getAssetsNoncesPayload]: 'get_assets_nonces'
}

export function canSignKind(kind: SigningPayloadID): boolean {
  return (
    kind <= SigningPayloadID.getOrderPayload ||
    kind === SigningPayloadID.syncStatesPayload ||
    kind === SigningPayloadID.getStatesPayload ||
    kind === SigningPayloadID.updateMovementPayload ||
    kind === SigningPayloadID.listAccountStakesPayload ||
    kind === SigningPayloadID.listAccountStakingStatementsPayload ||
    kind === SigningPayloadID.listAccountStakingDividendsPayload ||
    kind === SigningPayloadID.getOrdersForMovementPayload ||
    kind === SigningPayloadID.getAssetsNoncesPayload
  )
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
