import { buildNEOBlockchainSignatureData } from './signNEOBlockchainData'
import { SigningPayloadID } from '../payload'
import config from '../__tests__/config.json'

test('build NEO blockchain signature data, market order payload, NEO_ETH', async () => {
  const payload = {
    amount: { amount: '10.123456', currency: 'neo' },
    buyOrSell: 'buy',
    marketName: 'neo_eth',
    nonceFrom: 0,
    nonceOrder: 0,
    nonceTo: 0,
    timestamp: 1551452048302
  }

  const data = buildNEOBlockchainSignatureData(config, { kind: SigningPayloadID.placeMarketOrderPayload, payload })
  expect(data).toBe(
    '01fd783cc6b77e38f6ad89af019cfdd1a6fc95e4d39b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc5000000000000000000000000000000000000000000000000000000000000000000000000f4030000000000000000000000000000ffffffffffffffff90d00300000000000000000000000000039fcee26c1f54024d19c0affcf6be8187467c9ba4749106a4b897a08b9e8fed23'
  )
})

test('build NEO blockchain signature data, market order payload, GAS_NEO', async () => {
  const payload = {
    amount: { amount: '10.123456', currency: 'neo' },
    buyOrSell: 'BUY',
    marketName: 'gas_neo',
    nonceFrom: 0,
    nonceOrder: 0,
    nonceTo: 0,
    timestamp: 1551452048302
  }

  const data = buildNEOBlockchainSignatureData(config, { kind: SigningPayloadID.placeMarketOrderPayload, payload })
  const want =
    '01fd783cc6b77e38f6ad89af019cfdd1a6fc95e4d3e72d286979ee6cb1b7e65dfddfb2e384100b8d148e7758de42e4168b71792c609b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc500000000000000000000000000000000c0789a00000000000000000000000000ffffffffffffffff90d00300000000000000000000000000039fcee26c1f54024d19c0affcf6be8187467c9ba4749106a4b897a08b9e8fed23'

  expect(data).toBe(want)
})
