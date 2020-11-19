// import { signNEOBlockchainData, buildNEOBlockchainSignatureData } from './signNEOBlockchainData'
import signPayload from '../signPayload'
import { SigningPayloadID, MovementTypeWithdrawal, MovementTypeDeposit } from '../payload'
import config from '../__tests__/blockchain_config.json'
import sigTestVectors from '../__tests__/signatureVectors.json'
import {
  // buildNEOOrderSignatureData,
  signNEOBlockchainData,
  buildNEOMovementSignatureData
} from './signNEOBlockchainData'

test('sign NEO deposit movement', async () => {
  const data = sigTestVectors.movements.a
  const payload = {
    address: data.address,
    nonce: data.nonce,
    quantity: { amount: '17.00000000', currency: 'neo' },
    recycled_orders: data.recycledOrders,
    timestamp: data.timestamp,
    type: MovementTypeDeposit
  }

  const signingPayload = { kind: SigningPayloadID.addMovementPayload, payload }

  const rawData = buildNEOMovementSignatureData(
    config.wallets.neo.address,
    config.wallets.neo.publicKey,
    config.assetData,
    signingPayload
  ).toUpperCase()
  expect(rawData).toBe(data.raw.neo)
  const sig = signNEOBlockchainData(config.wallets.neo.privateKey, rawData)
  expect(sig.blockchain).toBe('NEO')
  expect(sig.signature).toBe(data.blockchainSignatures.neo)

  const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)

  const expectedCanonicalString =
    'add_movement,{"address":"arw6fwqwtmtzsfdjkzih1vvmy4ibnmuvmo","nonce":5432876,"quantity":{"amount":"17.00000000","currency":"neo"},"timestamp":1565314439709,"type":"deposit"}'
  expect(payloadRes.canonicalString).toBe(expectedCanonicalString)

  expect(payloadRes.blockchainMovement).toEqual({
    address: '6f6f85bfffb412967af3dd0d71a5e2f8a759006c',
    amount: '00f1536500000000',
    asset: '9b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc5',
    nonce: '2ce6520000000000',
    prefix: '02',
    userPubKey: config.wallets.neo.publicKey,
    userSig: data.blockchainSignatures.neo
  })
  expect(payloadRes.payload.resigned_orders).toEqual(data.resigned_orders)
})

test('sign GAS withdrawal movement', async () => {
  const data = sigTestVectors.movements.c
  const payload = {
    address: data.address,
    nonce: data.nonce,
    quantity: { amount: '11.00000000', currency: 'gas' },
    timestamp: data.timestamp,
    type: MovementTypeWithdrawal
  }

  const signingPayload = { kind: SigningPayloadID.addMovementPayload, payload }

  const rawData = buildNEOMovementSignatureData(
    config.wallets.neo.address,
    config.wallets.neo.publicKey,
    config.assetData,
    signingPayload
  ).toUpperCase()
  expect(rawData).toBe(data.raw.neo)
  const sig = signNEOBlockchainData(config.wallets.neo.privateKey, rawData)
  expect(sig.blockchain).toBe('NEO')
  expect(sig.signature).toBe(data.blockchainSignatures.neo)

  const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)

  const expectedCanonicalString =
    'add_movement,{"address":"arw6fwqwtmtzsfdjkzih1vvmy4ibnmuvmo","nonce":5432876,"quantity":{"amount":"11.00000000","currency":"gas"},"timestamp":1565362337483,"type":"withdrawal"}'
  expect(payloadRes.canonicalString).toBe(expectedCanonicalString)

  expect(payloadRes.blockchainMovement).toEqual({
    address: '6f6f85bfffb412967af3dd0d71a5e2f8a759006c',
    amount: '00ab904100000000',
    asset: 'e72d286979ee6cb1b7e65dfddfb2e384100b8d148e7758de42e4168b71792c60',
    nonce: '2ce6520000000000',
    prefix: '03',
    userPubKey: config.wallets.neo.publicKey,
    userSig: data.blockchainSignatures.neo
  })
})

// test('sign NEO_GAS blockchain market order data', async () => {
//   const data = sigTestVectors.marketOrders.neo_gas
//   const payload = {
//     amount: { amount: data.amount.value, currency: data.amount.currency },
//     buyOrSell: data.buyOrSell,
//     marketName: data.marketName,
//     nonceOrder: data.nonceOrder,
//     noncesFrom: [data.nonceFrom],
//     noncesTo: [data.nonceTo],
//     timestamp: data.timestamp
//   }

//   const signingPayload = { kind: SigningPayloadID.placeMarketOrderPayload, payload }

//   const rawData = buildNEOOrderSignatureData(
//     config.wallets.neo.address,
//     config.wallets.neo.publicKey,
//     config.assetData,
//     config.marketData,
//     signingPayload,
//     {
//       chain: 'neo',
//       nonceFrom: data.nonceFrom,
//       nonceTo: data.nonceTo
//     }
//   ).toUpperCase()
//   expect(rawData).toBe(data.raw.neo)
//   const sig = signNEOBlockchainData(config.wallets.neo.privateKey, rawData)
//   expect(sig.blockchain).toBe('NEO')
//   expect(sig.signature).toBe(data.blockchainSignatures.neo)

//   const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)

//   const expectedCanonicalString =
//     'place_market_order,{"amount":{"amount":"10.000","currency":"neo"},"buy_or_sell":"sell","market_name":"neo_gas","nonce_from":4294967295,"nonce_order":5432876,"nonce_to":4294967295,"timestamp":12345648}'

//   expect(payloadRes.payload.blockchainSignatures).toHaveLength(1)

//   expect(payloadRes.canonicalString).toBe(expectedCanonicalString)
//   expect(payloadRes.blockchainRaw[0].raw.toUpperCase()).toBe(data.raw.neo)
// })

// test('sign NEO_GAS blockchain limit order data', async () => {
//   const data = sigTestVectors.limitOrders.a
//   const signingPayload = createPlaceLimitOrderParams(
//     data.allowTaker,
//     { amount: data.amount.value, currency: data.amount.currency },
//     data.buyOrSell,
//     data.cancellationPolicy,
//     {
//       amount: data.limitPrice.value,
//       currency_a: data.limitPrice.currency_a,
//       currency_b: data.limitPrice.currency_b
//     },
//     data.marketName,
//     [data.nonceFrom],
//     [data.nonceTo],
//     data.nonceOrder
//   )

//   // const signingPayload = { kind: SigningPayloadID.placeLimitOrderPayload, payload }

//   // const rawData = buildNEOOrderSignatureData(config, signingPayload, {
//   //   chain: 'neo',
//   //   nonceFrom: data.nonceFrom,
//   //   nonceTo: data.nonceTo
//   // }).toUpperCase()
//   // expect(rawData).toBe(data.raw.neo)
//   // const sig = signNEOBlockchainData(config.wallets.neo.privateKey, rawData)
//   // expect(sig.blockchain).toBe('NEO')
//   // expect(sig.signature).toBe(data.blockchainSignatures.neo)

//   const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)

//   // const expectedCanonicalString =
//   //   'place_limit_order,{"allow_taker":false,"amount":{"amount":"10.000000","currency":"gas"},"buy_or_sell":"sell","cancellation_policy":"immediate_or_cancel","limit_price":{"amount":"17.000","currency_a":"neo","currency_b":"gas"},"market_name":"gas_neo","nonce_from":4294967295,"nonce_order":5432876,"nonce_to":4294967295,"timestamp":12345648}'
//   // expect(payloadRes.canonicalString).toBe(expectedCanonicalString)

// })
