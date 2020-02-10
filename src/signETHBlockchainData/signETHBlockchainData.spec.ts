import {
  buildETHMovementSignatureData,
  buildETHOrderSignatureData,
  signETHBlockchainData
} from './signETHBlockchainData'
import { SigningPayloadID, MovementTypeDeposit, MovementTypeWithdrawal, createAddMovementParams } from '../payload'
import config from '../__tests__/blockchain_config.json'
import signPayload from '../signPayload'
import sigTestVectors from '../__tests__/signatureVectors.json'
import { buildNEOOrderSignatureData, signNEOBlockchainData } from '../signNEOBlockchainData'

test('eth sig generation', async () => {
  const payload =
    '018A9CFDCE74362D038BE959C063F7078D7116EDB60000FFFF5F2667E85F2667E8000000000000269A0000000000000000FFFFFFFFFFFFFFFF000000000003D0905F2667E8'
  const result = signETHBlockchainData('499541c745fd4c442e22cc160e69c8063d9885a9a680c23ceb1501b8d883eea6', payload)
  expect(result.signature).toHaveLength(130)
})

test('sign eth deposit movement', async () => {
  const data = sigTestVectors.movements.b

  const signingPayload = createAddMovementParams(
    data.address,
    { amount: '1.32450000', currency: 'eth' },
    MovementTypeDeposit,
    data.nonce,
    data.timestamp
  )

  const rawData = buildETHMovementSignatureData(config.wallets.eth.address, signingPayload).toUpperCase()
  expect(rawData).toBe(data.raw.eth)
  const sig = signETHBlockchainData(config.wallets.eth.privateKey, rawData)
  expect(sig.blockchain).toBe('ETH')
  expect(sig.signature).toBe(data.blockchainSignatures.eth)

  const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)

  const expectedCanonicalString =
    'add_movement,{"address":"fa39fddde46cea3060b91f80abed8672f77c5bea","nonce":5432876,"quantity":{"amount":"1.32450000","currency":"eth"},"timestamp":1565323885016,"type":"deposit"}'
  expect(payloadRes.canonicalString).toBe(expectedCanonicalString)

  expect(payloadRes.blockchainMovement).toEqual({
    address: 'fa39fddde46cea3060b91f80abed8672f77c5bea',
    amount: '132450000',
    asset: '0000',
    nonce: '0052e62c',
    prefix: '02',
    userPubKey: 'fa39fddde46cea3060b91f80abed8672f77c5bea',
    userSig: data.blockchainSignatures.eth
  })
})

test('sign usdc withdraw movement', async () => {
  const data = sigTestVectors.movements.d
  const payload = {
    address: data.address,
    nonce: data.nonce,
    quantity: { amount: '3.03200400', currency: 'usdc' },
    timestamp: data.timestamp,
    type: MovementTypeWithdrawal
  }

  const signingPayload = { kind: SigningPayloadID.addMovementPayload, payload }

  const rawData = buildETHMovementSignatureData(config.wallets.eth.address, signingPayload).toUpperCase()
  expect(rawData).toBe(data.raw.eth)
  const sig = signETHBlockchainData(config.wallets.eth.privateKey, rawData)
  expect(sig.blockchain).toBe('ETH')
  expect(sig.signature).toBe(data.blockchainSignatures.eth)

  const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)

  const expectedCanonicalString =
    'add_movement,{"address":"fa39fddde46cea3060b91f80abed8672f77c5bea","nonce":5432876,"quantity":{"amount":"3.03200400","currency":"usdc"},"timestamp":1565362799120,"type":"withdrawal"}'

  expect(payloadRes.canonicalString).toBe(expectedCanonicalString)

  expect(payloadRes.blockchainMovement).toEqual({
    address: 'fa39fddde46cea3060b91f80abed8672f77c5bea',
    amount: '303200400',
    asset: '0003',
    nonce: '0052e62c',
    prefix: '03',
    userPubKey: 'fa39fddde46cea3060b91f80abed8672f77c5bea',
    userSig: data.blockchainSignatures.eth
  })
})

test('sign ETH blockchain market order data', async () => {
  const data = sigTestVectors.marketOrders.eth_usdc
  const payload = {
    amount: { amount: data.amount.value, currency: data.amount.currency },
    buyOrSell: data.buyOrSell,
    marketName: data.marketName,
    nonceOrder: data.nonceOrder,
    noncesFrom: [data.nonceFrom],
    noncesTo: [data.nonceTo],
    timestamp: data.timestamp
  }

  const signingPayload = { kind: SigningPayloadID.placeMarketOrderPayload, payload }
  const rawData = buildETHOrderSignatureData(config.wallets.eth.address, config.marketData, signingPayload, {
    chain: 'eth',
    nonceFrom: data.nonceFrom,
    nonceTo: data.nonceTo
  })
  expect(rawData).toBe(data.raw.eth)

  const sig = await signETHBlockchainData(config.wallets.eth.privateKey, rawData)
  expect(sig.blockchain).toBe('ETH')
  expect(sig.signature).toBe(data.blockchainSignatures.eth)

  const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)
  const canonicalExpected =
    'place_market_order,{"amount":{"amount":"10.000000","currency":"eth"},"buy_or_sell":"sell","market_name":"eth_usdc","nonce_from":4294967295,"nonce_order":5432876,"nonce_to":4294967295,"timestamp":12345648}'

  expect(payloadRes.canonicalString).toBe(canonicalExpected)
})

test('sign ETH/NEO blockchain market order data', async () => {
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

  const signingPayload = { kind: SigningPayloadID.placeMarketOrderPayload, payload }
  const rawDataEth = buildETHOrderSignatureData(config.wallets.eth.address, config.marketData, signingPayload, {
    chain: 'eth',
    nonceFrom: data.nonceFrom,
    nonceTo: data.nonceTo
  }).toUpperCase()
  const rawDataNeo = buildNEOOrderSignatureData(config, signingPayload, {
    chain: 'neo',
    nonceFrom: data.nonceFrom,
    nonceTo: data.nonceTo
  }).toUpperCase()
  expect(rawDataEth).toBe(data.raw.eth)
  expect(rawDataNeo).toBe(data.raw.neo)

  const sigEth = signETHBlockchainData(config.wallets.eth.privateKey, rawDataEth)
  const sigNeo = signNEOBlockchainData(config.wallets.neo.privateKey, rawDataNeo)

  expect(sigNeo.signature).toBe(data.blockchainSignatures.neo)
  expect(sigEth.signature).toBe(data.blockchainSignatures.eth)

  const canonicalExpected =
    'place_market_order,{"amount":{"amount":"10.00000000","currency":"eth"},"buy_or_sell":"sell","market_name":"eth_neo","nonce_from":4294967295,"nonce_order":5432876,"nonce_to":4294967295,"timestamp":12345648}'

  const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)
  expect(payloadRes.canonicalString).toBe(canonicalExpected)

  expect(payloadRes.signature).toBe(data.signature)
})

test('sign ETH_GAS blockchain limit order data', async () => {
  const data = sigTestVectors.limitOrders.b
  const payload = {
    allowTaker: data.allowTaker,
    amount: { amount: data.amount.value, currency: data.amount.currency },
    buyOrSell: data.buyOrSell,
    cancellationPolicy: data.cancellationPolicy,
    limitPrice: {
      amount: data.limitPrice.value,
      currency_a: data.limitPrice.currency_a,
      currency_b: data.limitPrice.currency_b
    },
    marketName: data.marketName,
    nonceOrder: data.nonceOrder,
    noncesFrom: [data.nonceFrom],
    noncesTo: [data.nonceTo],
    timestamp: data.timestamp
  }

  const signingPayload = { kind: SigningPayloadID.placeLimitOrderPayload, payload }

  const rawDataEth = buildETHOrderSignatureData(config.wallets.eth.address, config.marketData, signingPayload, {
    chain: 'eth',
    nonceFrom: data.nonceFrom,
    nonceTo: data.nonceTo
  }).toUpperCase()
  const rawDataNeo = buildNEOOrderSignatureData(config, signingPayload, {
    chain: 'neo',
    nonceFrom: data.nonceFrom,
    nonceTo: data.nonceTo
  }).toUpperCase()
  expect(rawDataEth).toBe(data.raw.eth)
  expect(rawDataNeo).toBe(data.raw.neo)

  const sigEth = signETHBlockchainData(config.wallets.eth.privateKey, rawDataEth)
  const sigNeo = signNEOBlockchainData(config.wallets.neo.privateKey, rawDataNeo)

  expect(sigNeo.signature).toBe(data.blockchainSignatures.neo)
  expect(sigEth.signature).toBe(data.blockchainSignatures.eth)

  const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)
  expect(payloadRes.payload.blockchainSignatures).toHaveLength(2)

  const expectedCanonicalString =
    'place_limit_order,{"allow_taker":true,"amount":{"amount":"10.00000000","currency":"eth"},"buy_or_sell":"sell","cancellation_policy":"immediate_or_cancel","limit_price":{"amount":"0.0024","currency_a":"gas","currency_b":"eth"},"market_name":"eth_gas","nonce_from":4294967295,"nonce_order":5432876,"nonce_to":4294967295,"timestamp":1565361133707}'
  expect(payloadRes.canonicalString).toBe(expectedCanonicalString)
})
