import { signNEOBlockchainData, buildNEOBlockchainSignatureData } from './signNEOBlockchainData'
import { SigningPayloadID } from '../payload'
import config from '../__tests__/config.json'
import sigTestVectors from '../__tests__/signatureVectors.json'

test('sign NEO blockchain market order data', async () => {
  for (const data of sigTestVectors.marketOrders) {
    const payload = {
      amount: { amount: data.amount.value, currency: data.amount.currency },
      buyOrSell: data.buyOrSell,
      marketName: data.marketName,
      nonceFrom: 0,
      nonceOrder: 0,
      nonceTo: 0,
      timestamp: data.timestamp
    }
    const rawData = buildNEOBlockchainSignatureData(config, { kind: SigningPayloadID.placeMarketOrderPayload, payload })
    expect(rawData).toBe(data.raw)

    const sig = signNEOBlockchainData(config.wallets.neo.privateKey, rawData)
    expect(sig.blockchain).toBe('neo')
    expect(sig.signature.toUpperCase()).toBe(data.blockchainSignatures.neo)
  }
})
