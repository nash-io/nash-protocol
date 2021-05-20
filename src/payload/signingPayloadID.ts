import { MovementTypeWithdrawal, MovementTypeDeposit, MovementTypeTransfer } from './payload'

/**
 * IDs mapping Nash Matching Engine operations with handling strategies.
 */
export enum SigningPayloadID {
  listOrderPayload = 0,
  cancelOrderPayload = 1,
  listAccountBalancePayload = 2,
  getAccountVolumesPayload = 3,
  listMovementsPayload = 4,
  getAccountBalancePayload = 5,
  getDepositAddressPayload = 6,
  getMovementPayload = 7,
  getOrderPayload = 8,

  // The payloads below requires blockchain information/signatures.
  placeLimitOrderPayload = 9,
  placeStopLimitOrderPayload = 10,
  placeStopMarketOrderPayload = 11,
  placeMarketOrderPayload = 12,
  addMovementPayload = 13,
  syncStatePayload = 14,

  cancelAllOrdersPayload = 17,
  listAccountTransactionsPayload = 18,
  getAccountPortfolioPayload = 19,

  getStatesPayload = 20,
  signStatesPayload = 21,
  updateMovementPayload = 22,
  listAccountStakesPayload = 23,
  listAccountStakingStatementsPayload = 24,
  listAccountStakingDividendsPayload = 25,

  getOrdersForMovementPayload = 26,
  getAssetsNoncesPayload = 27,

  getAccountAddressPayload = 28,
  sendBlockchainRawTransactionPayload = 29,

  listTradePayload = 30,
  updatedAccountOrders = 31,
  newAccountTrades = 32,
  createContactPayload = 33,
  updateContactPayload = 34,
  searchContactsPayload = 35,

  prepareMovementPayload = 36,

  prepareTransactionPayload = 37,
  iterateTransactionPayload = 38
}

export const PayloadIDToName: Record<SigningPayloadID, string> = {
  [SigningPayloadID.listOrderPayload]: 'list_account_orders',
  [SigningPayloadID.updatedAccountOrders]: 'subscribe_to_account_orders',
  [SigningPayloadID.cancelOrderPayload]: 'cancel_order',
  [SigningPayloadID.listTradePayload]: 'list_account_trades',
  [SigningPayloadID.newAccountTrades]: 'subscribe_to_account_trades',
  [SigningPayloadID.listAccountBalancePayload]: 'list_account_balances',
  [SigningPayloadID.getAccountVolumesPayload]: 'get_account_volumes',
  [SigningPayloadID.listMovementsPayload]: 'list_movements',
  [SigningPayloadID.getAccountBalancePayload]: 'get_account_balance',
  [SigningPayloadID.getDepositAddressPayload]: 'get_deposit_address',
  [SigningPayloadID.getMovementPayload]: 'get_movement',
  [SigningPayloadID.getOrderPayload]: 'get_account_order',
  [SigningPayloadID.placeLimitOrderPayload]: 'place_limit_order',
  [SigningPayloadID.placeStopLimitOrderPayload]: 'place_stop_limit_order',
  [SigningPayloadID.placeStopMarketOrderPayload]: 'place_stop_market_order',
  [SigningPayloadID.placeMarketOrderPayload]: 'place_market_order',
  [SigningPayloadID.addMovementPayload]: 'add_movement',
  [SigningPayloadID.syncStatePayload]: 'sync_states',
  [SigningPayloadID.cancelAllOrdersPayload]: 'cancel_all_orders',
  [SigningPayloadID.listAccountTransactionsPayload]: 'list_account_transactions',
  [SigningPayloadID.getAccountPortfolioPayload]: 'get_account_portfolio',
  [SigningPayloadID.getStatesPayload]: 'get_states',
  [SigningPayloadID.signStatesPayload]: 'sign_states',
  [SigningPayloadID.updateMovementPayload]: 'update_movement',
  [SigningPayloadID.listAccountStakesPayload]: 'list_account_stakes',
  [SigningPayloadID.listAccountStakingStatementsPayload]: 'list_account_staking_statements',
  [SigningPayloadID.listAccountStakingDividendsPayload]: 'list_account_staking_dividends',
  [SigningPayloadID.getOrdersForMovementPayload]: 'get_orders_for_movement',
  [SigningPayloadID.getAssetsNoncesPayload]: 'get_assets_nonces',
  [SigningPayloadID.getAccountAddressPayload]: 'get_account_address',
  [SigningPayloadID.sendBlockchainRawTransactionPayload]: 'send_blockchain_raw_transaction',
  [SigningPayloadID.createContactPayload]: 'create_contact',
  [SigningPayloadID.updateContactPayload]: 'update_contact',
  [SigningPayloadID.searchContactsPayload]: 'search_contacts',
  [SigningPayloadID.prepareMovementPayload]: 'prepare_movement',
  [SigningPayloadID.prepareTransactionPayload]: 'prepare_transaction',
  [SigningPayloadID.iterateTransactionPayload]: 'iterate_transaction'
}

export function kindToName(kind: SigningPayloadID): string {
  const name = PayloadIDToName[kind]

  if (name == null) {
    throw new Error(`Cannot use nash-protocol to get name with kind ${kind}`)
  }

  return PayloadIDToName[kind] as string
}

export function isStateSigning(kind: SigningPayloadID): boolean {
  return kind === SigningPayloadID.signStatesPayload
}

export function needBlockchainSignature(kind: SigningPayloadID, payload): boolean {
  if (
    [
      SigningPayloadID.placeLimitOrderPayload,
      SigningPayloadID.placeMarketOrderPayload,
      SigningPayloadID.placeStopLimitOrderPayload,
      SigningPayloadID.placeStopMarketOrderPayload
    ].indexOf(kind) > -1
  ) {
    return true
  }

  return (
    kind === SigningPayloadID.addMovementPayload && [MovementTypeDeposit, MovementTypeWithdrawal].includes(payload.type)
  )
}

export function needBlockchainMovement(kind: SigningPayloadID): boolean {
  return kind === SigningPayloadID.addMovementPayload
}

export function isOrderPayload(kind: SigningPayloadID): boolean {
  return kind > SigningPayloadID.getOrderPayload && kind < SigningPayloadID.addMovementPayload
}

export function isLimitOrderPayload(kind: SigningPayloadID): boolean {
  return kind === SigningPayloadID.placeLimitOrderPayload || kind === SigningPayloadID.placeStopLimitOrderPayload
}

// Returns the prefix for the blockchain data based on the id of the payload.
export function kindToOrderPrefix(kind: SigningPayloadID, payload?: any): string {
  if (kind === SigningPayloadID.syncStatePayload) {
    return '00'
  }
  if (isOrderPayload(kind)) {
    return '01'
  }
  if (kind === SigningPayloadID.addMovementPayload && payload.type === MovementTypeDeposit) {
    return '02'
  }
  if (kind === SigningPayloadID.addMovementPayload && payload.type === MovementTypeWithdrawal) {
    return '03'
  }
  if (kind === SigningPayloadID.addMovementPayload && payload.type === MovementTypeTransfer) {
    return ''
  }

  throw new Error(`invalid kind given ${kindToName(kind)}`)
}
