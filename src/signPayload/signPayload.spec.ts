import { ec as EC } from 'elliptic'

import bufferize from '../bufferize'
import stringify from '../stringify'
import { SigningPayloadID, SignStatesRequestPayload } from '../payload'
import signPayload, { canonicalString } from '../signPayload'
import config from '../__tests__/blockchain_config.json'
import state_signing_config from '../__tests__/state_signing_config.json'
import sigTestVectors from '../__tests__/signatureVectors.json'
import _ from 'lodash'
import { inferBlockchainData, OrderSignatureData, buildOrderSignatureData } from '../utils/blockchain'
import { determineSignatureNonceTuplesNeeded } from './signPayload'

const privateKeyHex = '2304cae8deb223fbc6774964af6bc4fcda6ba6cff8276cb2c0f49fb0c8a51d57'
const privateKey = Buffer.from(privateKeyHex, 'hex')
const ORDER_NONCE_IGNORE = 4294967295

describe('state signing', () => {
  const stateSigningPrivateKey = Buffer.from(state_signing_config.payloadSigningKey.privateKey, 'hex')

  test('getStates canonical string', () => {
    const payload = {
      kind: SigningPayloadID.getStatesPayload,
      payload: {
        timestamp: state_signing_config.fixtures.getStates.timestamp
      }
    }
    const signedPayload = signPayload(stateSigningPrivateKey, payload)
    expect(signedPayload.canonicalString).toBe('get_states,{"timestamp":1565613913256}')
    expect(signedPayload.signature).toBe(state_signing_config.fixtures.getStates.signature)
  })

  test('sign states', async () => {
    const payload = {
      kind: SigningPayloadID.signStatesPayload,
      payload: {
        recycled_orders: state_signing_config.fixtures.signStates.a.recycled_orders,
        states: state_signing_config.fixtures.signStates.a.states,
        timestamp: state_signing_config.fixtures.signStates.a.timestamp
      }
    }

    const signedPayload = signPayload(stateSigningPrivateKey, payload, state_signing_config)
    expect(signedPayload.canonicalString).toBe('sign_states,{"timestamp":1565613913000}')
    expect(signedPayload.signature).toBe(state_signing_config.fixtures.signStates.a.signature)

    const payloadWithStates = signedPayload.payload as SignStatesRequestPayload
    expect(payloadWithStates.client_signed_states).toEqual(
      state_signing_config.fixtures.signStates.a.client_signed_states
    )
  })

  test('sign states with recycled orders', async () => {
    const payload = {
      kind: SigningPayloadID.signStatesPayload,
      payload: {
        recycled_orders: state_signing_config.fixtures.signStates.b.recycled_orders,
        states: state_signing_config.fixtures.signStates.b.states,
        timestamp: state_signing_config.fixtures.signStates.b.timestamp
      }
    }

    const signedPayload = signPayload(stateSigningPrivateKey, payload, state_signing_config)
    expect(signedPayload.canonicalString).toBe('sign_states,{"timestamp":1565631597000}')
    expect(signedPayload.signature).toBe(state_signing_config.fixtures.signStates.b.signature)

    const payloadWithStates = signedPayload.payload as SignStatesRequestPayload
    expect(payloadWithStates.client_signed_states).toEqual(
      state_signing_config.fixtures.signStates.b.client_signed_states
    )
    expect(payloadWithStates.signed_recycled_orders).toEqual(
      state_signing_config.fixtures.signStates.b.signed_recycled_orders
    )
  })

  test('sync states has correct payload', async () => {
    const payload = {
      kind: SigningPayloadID.syncStatePayload,
      payload: {
        server_signed_states: state_signing_config.fixtures.syncStates.server_signed_states,
        timestamp: state_signing_config.fixtures.syncStates.timestamp
      }
    }
    const signedPayload = signPayload(stateSigningPrivateKey, payload, state_signing_config)
    expect(signedPayload.canonicalString).toBe('sync_states,{"timestamp":1565613913256}')
  })
})

test('get private key import behaves correctly', () => {
  const curve = new EC('secp256k1')
  const keypair = curve.keyFromPrivate(privateKey)
  const pubkey = keypair.getPublic().encode(true, 'hex')
  const out = stringify(bufferize(pubkey))
  expect(out).toBe('037e2bf05c0bcb67a0de3f285e855b0b538aa57006fc1caa0802b9e944f93b343a')
})

describe('canonical string()', () => {
  it('lowercases and stringifies', () => {
    const output = canonicalString({ FOO: 'FOO' })
    const expectation = '{"foo":"foo"}'

    expect(output).toBe(expectation)
  })

  it('deeply snake cases keys', () => {
    const output = canonicalString({
      deep: { willBeSnakeCased: 'willNotBeSnakeCased' },
      willBeSnakeCased: 'willNotBeSnakeCased'
    })
    const expectation =
      '{"deep":{"will_be_snake_cased":"willnotbesnakecased"},"will_be_snake_cased":"willnotbesnakecased"}'

    expect(output).toBe(expectation)
  })

  it('alphabetizes keys', () => {
    const output = canonicalString({ foo: true, bar: true })
    const expectation = '{"bar":true,"foo":true}'

    expect(output).toBe(expectation)
  })
})

test('serialize, hash, and sign get account balance payload', () => {
  const payload = {
    currency: 'eth',
    timestamp: 1552027305931
  }

  const payloadSignature = signPayload(privateKey, { kind: SigningPayloadID.getAccountBalancePayload, payload })
  expect(payloadSignature.signature).toBe(
    '304502210094d4f1d0436e308c50218361dc7854ec30f1ef93145b14671760dada53c5f1e0022059a6ac14c35e775398ecd130dfcde6dc359ba7a9fca8b59413d54aa88697aff8'
  )
})

test('serialize, hash, and sign get deposit address payload', () => {
  const payload = { currency: 'neo', timestamp: 1552027306271 }

  const payloadSignature = signPayload(privateKey, { kind: SigningPayloadID.getDepositAddressPayload, payload })
  expect(payloadSignature.signature).toBe(
    '3044022025c43614439598ab3855fd59103fa8e83f0dfb4418a923481114e5bc3f4201d602205a02cc3c3ccd54a4ca9e7aed7c5cafab82bd942eba22929f2e50ddb47d814883'
  )
})

test('serialize, hash, and sign list movements payload', () => {
  const payload = { timestamp: 1552027307783 }
  const payloadSignature = signPayload(privateKey, { kind: SigningPayloadID.listMovementsPayload, payload })
  expect(payloadSignature.signature).toBe(
    '304402207e32a01d90325c0e805f7444ad6072b5346ed53caffee8bc036c22e394f4688302202ecf88557ae669de629193c685ed1f4d48e51a77e7e370371121b3d616782016'
  )
})

test('serialize, hash, and sign list account balances payload', () => {
  const payload = { ignore_low_balance: false, timestamp: 1552027306572 }

  const payloadSignature = signPayload(privateKey, { kind: SigningPayloadID.listAccountBalancePayload, payload })
  expect(payloadSignature.signature).toBe(
    '3045022100c6620f44e314adf6adae70c5964b0c0cedd0ac27f66ad0cbdec5beed8008f8f202202ba7a754c2b7c6d08f11533fef884ddb9d09b5210b668d0fafa83efeffa44716'
  )
})

test('serialize, hash, and sign list account volumes payload', () => {
  const payload = { timestamp: 1552027307483 }

  const payloadSignature = signPayload(privateKey, { kind: SigningPayloadID.getAccountVolumesPayload, payload })
  expect(payloadSignature.signature).toBe(
    '30450221008110ecd1db536668293d71615807cbb43514f438c26dbce163299277dcb5ca1602205ade911bae3a020667981880ca1401045e3a2ee841f429ae11a1fa1e73aada70'
  )
})

test('serialize, hash, and sign list account orders payload', () => {
  const payload = { timestamp: 1552027307101 }

  const payloadSignature = signPayload(privateKey, { kind: SigningPayloadID.listOrderPayload, payload })
  expect(payloadSignature.signature).toBe(
    '304502210094e709789a11dcb1404d7d66d8d9db11b7173a19bd1bdadab8e09c46c0208a6802207d8f726b7cc7d48c4efd27b02f730339426073da9a6ac98e4a4f97d120f60300'
  )

  const limitedPayload = { timestamp: 1552027307101, limit: 200 }

  const limitedPayloadSignature = signPayload(privateKey, {
    kind: SigningPayloadID.listOrderPayload,
    payload: limitedPayload
  })
  expect(limitedPayloadSignature.signature).toBe(payloadSignature.signature)
  expect(limitedPayloadSignature.canonicalString).toBe('list_account_orders,{"timestamp":1552027307101}')
  expect(limitedPayloadSignature.payload).toEqual(limitedPayload)
})

test('serialize, hash, and sign market order payload NEO_ETH', async () => {
  const data = sigTestVectors.marketOrders.eth_neo
  const payload = {
    amount: { amount: data.amount.value, currency: data.amount.currency },
    buyOrSell: data.buyOrSell,
    marketName: data.marketName,
    nonceOrder: data.nonceOrder,
    noncesFrom: [data.nonceFrom],
    noncesTo: [data.nonceTo],
    timestamp: data.timestamp
  }

  const signedPayload = signPayload(
    Buffer.from(config.payloadSigningKey.privateKey, 'hex'),
    { kind: SigningPayloadID.placeMarketOrderPayload, payload },
    config
  )

  expect(signedPayload.payload.blockchainSignatures).toHaveLength(2)
  expect(signedPayload.signature).toBe(data.signature)
})

test('signing orders with multiple nonces', async () => {
  const data = sigTestVectors.marketOrders.eth_neo
  const payload = {
    amount: { amount: data.amount.value, currency: data.amount.currency },
    buyOrSell: data.buyOrSell,
    marketName: data.marketName,
    nonceOrder: data.nonceOrder,
    noncesFrom: [1],
    noncesTo: [1, 2],
    timestamp: data.timestamp
  }

  let blockchainData = inferBlockchainData({ kind: SigningPayloadID.placeMarketOrderPayload, payload })
  let orderData: OrderSignatureData = buildOrderSignatureData(config.marketData, config.assetData, {
    kind: SigningPayloadID.placeMarketOrderPayload,
    payload
  })

  let result = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  expect(result).toEqual([
    { chain: 'eth', nonceFrom: 1, nonceTo: ORDER_NONCE_IGNORE },
    { chain: 'neo', nonceFrom: ORDER_NONCE_IGNORE, nonceTo: 1 },
    { chain: 'neo', nonceFrom: ORDER_NONCE_IGNORE, nonceTo: 2 }
  ])

  let signedPayload = signPayload(
    Buffer.from(config.payloadSigningKey.privateKey, 'hex'),
    { kind: SigningPayloadID.placeMarketOrderPayload, payload },
    config
  )
  expect(signedPayload.payload.blockchainSignatures).toHaveLength(3)

  payload.noncesFrom = [1, 2]
  payload.noncesTo = [1]

  blockchainData = inferBlockchainData({ kind: SigningPayloadID.placeMarketOrderPayload, payload })
  orderData = buildOrderSignatureData(config.marketData, config.assetData, {
    kind: SigningPayloadID.placeMarketOrderPayload,
    payload
  })

  result = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  expect(result).toEqual([
    { chain: 'eth', nonceFrom: 1, nonceTo: ORDER_NONCE_IGNORE },
    { chain: 'eth', nonceFrom: 2, nonceTo: ORDER_NONCE_IGNORE },
    { chain: 'neo', nonceFrom: ORDER_NONCE_IGNORE, nonceTo: 1 }
  ])

  payload.noncesFrom = [1, 2]
  payload.noncesTo = [7, 8]

  blockchainData = inferBlockchainData({ kind: SigningPayloadID.placeMarketOrderPayload, payload })
  orderData = buildOrderSignatureData(config.marketData, config.assetData, {
    kind: SigningPayloadID.placeMarketOrderPayload,
    payload
  })

  result = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  expect(result).toEqual([
    { chain: 'eth', nonceFrom: 1, nonceTo: ORDER_NONCE_IGNORE },
    { chain: 'eth', nonceFrom: 2, nonceTo: ORDER_NONCE_IGNORE },
    { chain: 'neo', nonceFrom: ORDER_NONCE_IGNORE, nonceTo: 7 },
    { chain: 'neo', nonceFrom: ORDER_NONCE_IGNORE, nonceTo: 8 }
  ])

  payload.noncesFrom = [11, 12]
  payload.noncesTo = [17, 18]
  payload.marketName = 'neo_gas'
  blockchainData = inferBlockchainData({ kind: SigningPayloadID.placeMarketOrderPayload, payload })
  orderData = buildOrderSignatureData(config.marketData, config.assetData, {
    kind: SigningPayloadID.placeMarketOrderPayload,
    payload
  })

  result = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  expect(result).toEqual([
    { chain: 'neo', nonceFrom: 11, nonceTo: 17 },
    { chain: 'neo', nonceFrom: 11, nonceTo: 18 },
    { chain: 'neo', nonceFrom: 12, nonceTo: 17 },
    { chain: 'neo', nonceFrom: 12, nonceTo: 18 }
  ])

  signedPayload = signPayload(
    Buffer.from(config.payloadSigningKey.privateKey, 'hex'),
    { kind: SigningPayloadID.placeMarketOrderPayload, payload },
    config
  )
  expect(signedPayload.payload.blockchainSignatures).toHaveLength(4)
})
