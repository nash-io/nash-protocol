import { buildETHBlockchainSignatureData } from './signETHBlockchainData'
import { SigningPayloadID } from '../payload'
import config from '../__tests__/config'

test('build ETH blockchain signature data, market order payload, NEO_ETH', async () => {
  const payload = {
    amount: { amount: '10.123456', currency: 'neo' },
    buyOrSell: 'buy',
    marketName: 'neo_eth',
    nonceFrom: 0,
    nonceOrder: 0,
    nonceTo: 0,
    timestamp: 1551452048302
  }
  const ethSignatureData =
    '015F8B6D9D487C8136CC1AD87D6E176742AF625DE8FFFF0000000000000000000000000000000003F40000000000000000FFFFFFFFFFFFFFFF000000000003D09000000000'

  const data = buildETHBlockchainSignatureData(config, {
    kind: SigningPayloadID.placeMarketOrderPayload,
    payload
  })
  expect(data).toBe(ethSignatureData)
})
