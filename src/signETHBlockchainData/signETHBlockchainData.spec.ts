import { buildETHBlockchainSignatureData, signETHBlockchainData } from './signETHBlockchainData'
import { SigningPayloadID } from '../payload'
import config from '../__tests__/config.json'
import sigTestVectors from '../__tests__/signatureVectors.json'

test('sign ETH blockchain market order data', async () => {
  const data = sigTestVectors.marketOrders.neo_eth
  const payload = {
    amount: { amount: data.amount.value, currency: data.amount.currency },
    buyOrSell: data.buyOrSell,
    marketName: data.marketName,
    nonceFrom: 0,
    nonceOrder: 0,
    nonceTo: 0,
    timestamp: data.timestamp
  }

  const rawData = buildETHBlockchainSignatureData(config, { kind: SigningPayloadID.placeMarketOrderPayload, payload })
  expect(rawData).toBe(data.raw.eth)

  const sig = signETHBlockchainData(config.wallets.eth.privateKey, rawData)
  expect(sig.blockchain).toBe('eth')
  expect(sig.signature).toBe(data.blockchainSignatures.eth)
})
