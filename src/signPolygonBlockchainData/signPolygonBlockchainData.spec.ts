import {
  buildPolygonMovementSignatureData,
  buildPolygonOrderSignatureData,
  signPolygonBlockchainData
} from './signPolygonBlockchainData'
import {
  SigningPayloadID,
  MovementTypeDeposit,
  MovementTypeWithdrawal,
  createAddMovementParams,
  BuyOrSellBuy
} from '../payload'
import config from '../__tests__/blockchain_config.json'
import signPayload, { determineSignatureNonceTuplesNeeded } from '../signPayload'
import sigTestVectors from '../__tests__/signatureVectors.json'
import { buildOrderSignatureData, inferBlockchainData } from '../utils/blockchain'

test('eth polygon generation', async () => {
  const payload =
    '018A9CFDCE74362D038BE959C063F7078D7116EDB60000FFFF5F2667E85F2667E8000000000000269A0000000000000000FFFFFFFFFFFFFFFF000000000003D0905F2667E8'
  const result = signPolygonBlockchainData('499541c745fd4c442e22cc160e69c8063d9885a9a680c23ceb1501b8d883eea6', payload)
  expect(result.signature).toHaveLength(130)
})

test('sign matic deposit movement', async () => {
  const data = sigTestVectors.movements.e

  const signingPayload = createAddMovementParams(
    data.address,
    false,
    { amount: '1.32450000', currency: 'matic' },
    MovementTypeDeposit,
    data.nonce,
    data.timestamp
  )

  const rawData = buildPolygonMovementSignatureData(config.wallets.polygon.address, signingPayload).toUpperCase()
  expect(rawData).toBe(data.raw.polygon)
  const sig = signPolygonBlockchainData(config.wallets.polygon.privateKey, rawData)
  expect(sig.blockchain).toBe('POLYGON')
  expect(sig.signature).toBe(data.blockchainSignatures.polygon)

  const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)

  const expectedCanonicalString =
    'add_movement,{"address":"fa39fddde46cea3060b91f80abed8672f77c5bea","nonce":5432876,"quantity":{"amount":"1.32450000","currency":"matic"},"timestamp":1565323885016,"type":"deposit"}'
  expect(payloadRes.canonicalString).toBe(expectedCanonicalString)

  expect(payloadRes.blockchainMovement).toEqual({
    address: 'fa39fddde46cea3060b91f80abed8672f77c5bea',
    amount: '132450000',
    asset: '0000',
    nonce: '0052e62c',
    prefix: '02',
    userPubKey: 'fa39fddde46cea3060b91f80abed8672f77c5bea',
    userSig: data.blockchainSignatures.polygon
  })
})

test('sign derc20 withdraw movement', async () => {
  const data = sigTestVectors.movements.f
  const payload = {
    address: data.address,
    nonce: data.nonce,
    quantity: { amount: '3.03200400', currency: 'derc20' },
    timestamp: data.timestamp,
    type: MovementTypeWithdrawal
  }

  const signingPayload = { kind: SigningPayloadID.addMovementPayload, payload }

  const rawData = buildPolygonMovementSignatureData(config.wallets.polygon.address, signingPayload).toUpperCase()
  expect(rawData).toBe(data.raw.polygon)
  const sig = signPolygonBlockchainData(config.wallets.polygon.privateKey, rawData)
  expect(sig.blockchain).toBe('POLYGON')
  expect(sig.signature).toBe(data.blockchainSignatures.polygon)

  const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)

  const expectedCanonicalString =
    'add_movement,{"address":"fa39fddde46cea3060b91f80abed8672f77c5bea","nonce":5432876,"quantity":{"amount":"3.03200400","currency":"derc20"},"timestamp":1565362799120,"type":"withdrawal"}'

  expect(payloadRes.canonicalString).toBe(expectedCanonicalString)

  expect(payloadRes.blockchainMovement).toEqual({
    address: 'fa39fddde46cea3060b91f80abed8672f77c5bea',
    amount: '303200400',
    asset: '0003',
    nonce: '0052e62c',
    prefix: '03',
    userPubKey: 'fa39fddde46cea3060b91f80abed8672f77c5bea',
    userSig: data.blockchainSignatures.polygon
  })
})

// these test vectors taken from MatchingEngine test vectors

test('sign MATIC/DERC20 market buy order', async () => {
  const payload = {
    amount: { amount: 10, currency: 'MATIC' },
    buyOrSell: BuyOrSellBuy,
    marketName: 'matic_derc20',
    nonceOrder: 42,
    noncesFrom: [23],
    noncesTo: [5],
    timestamp: 1234
  }

  const signingPayload = { kind: SigningPayloadID.placeMarketOrderPayload, payload }
  const blockchainData = inferBlockchainData(signingPayload)
  const orderData = buildOrderSignatureData(config.marketData, config.assetData, signingPayload)
  const chainNoncePair = determineSignatureNonceTuplesNeeded(orderData, blockchainData)
  const rawData = buildPolygonOrderSignatureData(
    '9BAE2051097DC5DDF68D3C01D5FA5CCC7833109D',
    signingPayload,
    chainNoncePair[0],
    orderData
  )
  expect(rawData).toBe(
    '019BAE2051097DC5DDF68D3C01D5FA5CCC7833109D000300000000001700000005FFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF00000000000000000000002A'
  )
})
