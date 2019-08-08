import { signNEOBlockchainData, buildNEOBlockchainSignatureData } from './signNEOBlockchainData'
import signPayload from '../signPayload'
import { SigningPayloadID } from '../payload'
import config from '../__tests__/config.json'
import sigTestVectors from '../__tests__/signatureVectors.json'

test('sign NEO_GAS blockchain market order data', async () => {
  const data = sigTestVectors.marketOrders.neo_gas
  const payload = {
    amount: { amount: data.amount.value, currency: data.amount.currency },
    buyOrSell: data.buyOrSell,
    marketName: data.marketName,
    nonceFrom: data.nonceFrom,
    nonceOrder: data.nonceOrder,
    nonceTo: data.nonceTo,
    timestamp: data.timestamp
  }

  const signingPayload = { kind: SigningPayloadID.placeMarketOrderPayload, payload }

  const rawData = buildNEOBlockchainSignatureData(config, signingPayload).toUpperCase()
  expect(rawData).toBe(data.raw.neo)
  const sig = signNEOBlockchainData(config.wallets.neo.privateKey, rawData)
  expect(sig.blockchain).toBe('neo')
  expect(sig.signature.toUpperCase()).toBe(data.blockchainSignatures.neo)

  const payloadRes = signPayload(Buffer.from(config.payloadSigningKey.privateKey, 'hex'), signingPayload, config)

  const expectedCanonicalString =
    'place_market_order,{"amount":{"amount":"10.000","currency":"neo"},"buy_or_sell":"sell","market_name":"neo_gas","nonce_from":5432876,"nonce_order":5432876,"nonce_to":5432876,"timestamp":12345648}'

  expect(payloadRes.canonicalString).toBe(expectedCanonicalString)
})
