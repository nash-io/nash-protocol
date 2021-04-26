import {
  buildETHMovementSignatureData,
  buildETHOrderSignatureData,
  signETHBlockchainData
} from './signETHBlockchainData'
import {
  SigningPayloadID,
  MovementTypeDeposit,
  MovementTypeWithdrawal,
  createAddMovementParams,
  BuyOrSellBuy,
  BuyOrSellSell
} from '../payload'
import config from '../__tests__/blockchain_config.json'
import signPayload, { determineSignatureNonceTuplesNeeded } from '../signPayload'
import sigTestVectors from '../__tests__/signatureVectors.json'
import { buildOrderSignatureData, inferBlockchainData } from '../utils/blockchain'
// import { buildNEOOrderSignatureData, signNEOBlockchainData } from '../signNEOBlockchainData'

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
    false,
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

// these test vectors taken from MatchingEngine test vectors

test('sign ETH/BAT market buy order', async () => {
  const payload = {
    amount: { amount: 10, currency: 'ETH' },
    buyOrSell: BuyOrSellBuy,
    marketName: 'eth_bat',
    nonceOrder: 42,
    noncesFrom: [23],
    noncesTo: [5],
    timestamp: 1234
  }

  const signingPayload = { kind: SigningPayloadID.placeMarketOrderPayload, payload }
  const blockchainData = inferBlockchainData(signingPayload)
  const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
  const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  const rawData = buildETHOrderSignatureData(
    '9BAE2051097DC5DDF68D3C01D5FA5CCC7833109D',
    signingPayload,
    chainNoncePair[0],
    orderData
  )
  expect(rawData).toBe(
    '019BAE2051097DC5DDF68D3C01D5FA5CCC7833109D000100000000001700000005FFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF00000000000000000000002A'
  )
})

test('sign ETH/BAT market sell order', async () => {
  const payload = {
    amount: { amount: '10', currency: 'ETH' },
    buyOrSell: BuyOrSellSell,
    marketName: 'eth_bat',
    nonceOrder: 42,
    noncesFrom: [5],
    noncesTo: [23],
    timestamp: 1234
  }

  const signingPayload = { kind: SigningPayloadID.placeMarketOrderPayload, payload }
  const blockchainData = inferBlockchainData(signingPayload)
  const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
  const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  const rawData = buildETHOrderSignatureData(
    '927BEFA25F0CE45C5948DF9583C84234704C8DBA',
    signingPayload,
    chainNoncePair[0],
    orderData
  )
  expect(rawData).toBe(
    '01927BEFA25F0CE45C5948DF9583C84234704C8DBA000000010000000500000017000000003B9ACA000000000000000000FFFFFFFFFFFFFFFF00000000000000000000002A'
  )
})

test('sign ETH/BAT limit buy order', async () => {
  const payload = {
    amount: { amount: '10', currency: 'ETH' },
    buyOrSell: BuyOrSellBuy,
    limitPrice: {
      amount: '2',
      currency_a: 'eth',
      currency_b: 'bat'
    },
    marketName: 'eth_bat',
    nonceOrder: 42,
    noncesFrom: [23],
    noncesTo: [5],
    timestamp: 1234
  }

  const signingPayload = { kind: SigningPayloadID.placeLimitOrderPayload, payload }
  const blockchainData = inferBlockchainData(signingPayload)
  const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
  const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  //  console.info(orderData)
  const rawData = buildETHOrderSignatureData(
    '795B8C76F6C532FBE4B57EE6F9494BFA7C66B9EF',
    signingPayload,
    chainNoncePair[0],
    orderData
  )
  expect(rawData).toBe(
    '01795B8C76F6C532FBE4B57EE6F9494BFA7C66B9EF000100000000001700000005000000001DCD6500000000000BE420E0FFFFFFFFFFFFFFFF00000000000000000000002A'
  )
})

test('sign ETH/BAT limit sell order', async () => {
  const payload = {
    amount: { amount: '10', currency: 'ETH' },
    buyOrSell: BuyOrSellSell,
    limitPrice: {
      amount: '2',
      currency_a: 'eth',
      currency_b: 'bat'
    },
    marketName: 'eth_bat',
    nonceOrder: 42,
    noncesFrom: [5],
    noncesTo: [23],
    timestamp: 1234
  }

  const signingPayload = { kind: SigningPayloadID.placeLimitOrderPayload, payload }
  const blockchainData = inferBlockchainData(signingPayload)
  const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
  const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  const rawData = buildETHOrderSignatureData(
    '84FAB1D4EB2BC381A7710C84EBE1649EC045C3D9',
    signingPayload,
    chainNoncePair[0],
    orderData
  )
  expect(rawData).toBe(
    '0184FAB1D4EB2BC381A7710C84EBE1649EC045C3D9000000010000000500000017000000003B9ACA000000000002F90838FFFFFFFFFFFFFFFF00000000000000000000002A'
  )
})

test('sign ETH/USDC rate rounding', async () => {
  const payload = {
    amount: { amount: '1', currency: 'ETH' },
    buyOrSell: BuyOrSellBuy,
    limitPrice: {
      amount: '150',
      currency_a: 'usdc',
      currency_b: 'eth'
    },
    marketName: 'eth_usdc',
    nonceOrder: 42,
    noncesFrom: [23],
    noncesTo: [5],
    timestamp: 1234
  }

  const signingPayload = { kind: SigningPayloadID.placeLimitOrderPayload, payload }
  const blockchainData = inferBlockchainData(signingPayload)
  const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
  const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  const rawData = buildETHOrderSignatureData(
    'BE90B183D8FB2E50E821AEF2415522AB7D6CCB05',
    signingPayload,
    chainNoncePair[0],
    orderData
  )
  expect(rawData).toBe(
    '01BE90B183D8FB2E50E821AEF2415522AB7D6CCB05000300000000001700000005000000037E11D60000000000000A25A8FFFFFFFFFFFFFFFF00000000000000000000002A'
  )
})

test('limit eth_usdc sell 1.0 eth', async () => {
  const payload = {
    amount: { amount: '1', currency: 'ETH' },
    buyOrSell: BuyOrSellSell,
    limitPrice: {
      amount: '800',
      currency_a: 'usdc',
      currency_b: 'eth'
    },
    marketName: 'eth_usdc',
    nonceOrder: 42,
    noncesFrom: [5],
    noncesTo: [23],
    timestamp: 1234
  }

  const signingPayload = { kind: SigningPayloadID.placeLimitOrderPayload, payload }
  const blockchainData = inferBlockchainData(signingPayload)
  const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
  const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  const rawData = buildETHOrderSignatureData(
    '7BB0E95708FDA1AFEB83F567E8E47595A41904DC',
    signingPayload,
    chainNoncePair[0],
    orderData
  )
  expect(rawData).toBe(
    '017BB0E95708FDA1AFEB83F567E8E47595A41904DC0000000300000005000000170000000005F5E1000000001294735E00FFFFFFFFFFFFFFFF00000000000000000000002A'
  )
})

test('limit eth_usdc sell 1.0 eth', async () => {
  const payload = {
    amount: { amount: '1', currency: 'ETH' },
    buyOrSell: BuyOrSellSell,
    limitPrice: {
      amount: '800',
      currency_a: 'usdc',
      currency_b: 'eth'
    },
    marketName: 'eth_usdc',
    nonceOrder: 42,
    noncesFrom: [5],
    noncesTo: [23],
    timestamp: 1234
  }

  const signingPayload = { kind: SigningPayloadID.placeLimitOrderPayload, payload }
  const blockchainData = inferBlockchainData(signingPayload)
  const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
  const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  const rawData = buildETHOrderSignatureData(
    '7BB0E95708FDA1AFEB83F567E8E47595A41904DC',
    signingPayload,
    chainNoncePair[0],
    orderData
  )
  expect(rawData).toBe(
    '017BB0E95708FDA1AFEB83F567E8E47595A41904DC0000000300000005000000170000000005F5E1000000001294735E00FFFFFFFFFFFFFFFF00000000000000000000002A'
  )
})

// # WARNING: The following 3 tests an order that the matching engine won't accept
// # "wrong amount unit for target market",

// test('limit eth_bat buy 10.0 bat', async () => {
//   const payload = {
//     amount: { amount: '10', currency: 'BAT' },
//     buyOrSell: BuyOrSellBuy,
//     limitPrice: {
//       amount: '2',
//       currency_a: 'eth',
//       currency_b: 'bat'
//     },
//     marketName: 'eth_bat',
//     nonceOrder: 42,
//     noncesFrom: [5],
//     noncesTo: [23],
//     timestamp: 1234
//   }

//   const signingPayload = { kind: SigningPayloadID.placeLimitOrderPayload, payload }
//   const blockchainData = inferBlockchainData(signingPayload)
//   const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
//   const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
//   const rawData = buildETHOrderSignatureData(
//     'A24002F03F2AD04D2409AF47BB43E76A00C3EF01',
//     signingPayload,
//     chainNoncePair[0],
//     orderData
//   )
//   expect(rawData).toBe(
//     '01A24002F03F2AD04D2409AF47BB43E76A00C3EF0100000001000000050000001700000000773594000000000002F90838FFFFFFFFFFFFFFFF00000000000000000000002A'
//   )
// })
// test('limit eth_bat sell 10.0 bat', async () => {
//   const payload = {
//     amount: { amount: '10', currency: 'BAT' },
//     buyOrSell: BuyOrSellSell,
//     limitPrice: {
//       amount: '2',
//       currency_a: 'eth',
//       currency_b: 'bat'
//     },
//     marketName: 'eth_bat',
//     nonceOrder: 42,
//     noncesFrom: [23],
//     noncesTo: [5],
//     timestamp: 1234
//   }

//   const signingPayload = { kind: SigningPayloadID.placeLimitOrderPayload, payload }
//   const blockchainData = inferBlockchainData(signingPayload)
//   const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
//   const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
//   const rawData = buildETHOrderSignatureData(
//     '1E9FAD205D8D02C9CF347E2AA61A1E922AF0D0EA',
//     signingPayload,
//     chainNoncePair[0],
//     orderData
//   )
//   expect(rawData).toBe(
//     '011E9FAD205D8D02C9CF347E2AA61A1E922AF0D0EA000100000000001700000005000000003B9ACA00000000000BE420E0FFFFFFFFFFFFFFFF00000000000000000000002A'
//   )
// })
// test('limit eth_bat buy 10.0 bat, test price inversion', async () => {
//   const payload = {
//     amount: { amount: '10', currency: 'BAT' },
//     buyOrSell: BuyOrSellBuy,
//     limitPrice: {
//       amount: '.5',
//       currency_a: 'bat',
//       currency_b: 'eth'
//     },
//     marketName: 'eth_bat',
//     nonceOrder: 42,
//     noncesFrom: [5],
//     noncesTo: [23],
//     timestamp: 1234
//   }

//   const signingPayload = { kind: SigningPayloadID.placeLimitOrderPayload, payload }
//   const blockchainData = inferBlockchainData(signingPayload)
//   const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
//   const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
//   const rawData = buildETHOrderSignatureData(
//     '229470549E8978659247DB9E1D73E61316B9BC70',
//     signingPayload,
//     chainNoncePair[0],
//     orderData
//   )
//   expect(rawData).toBe(
//     '01229470549E8978659247DB9E1D73E61316B9BC7000000001000000050000001700000000773594000000000002F90838FFFFFFFFFFFFFFFF00000000000000000000002A'
//   )
// })
