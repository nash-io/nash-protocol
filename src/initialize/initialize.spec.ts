import { initialize } from './initialize'
import Config from '../__tests__/config.json'
import TestVectors from '../__tests__/testVectors.json'
import bufferize from '../bufferize'

const vector = TestVectors[0]

test('initializes a config object', async () => {
  const params = {
    aead: {
      encryptedSecretKey: bufferize(vector.encryptedSecretKey),
      nonce: bufferize(vector.nonce),
      tag: bufferize(vector.tag)
    },
    assetData: Config.assetData,
    encryptionKey: bufferize(vector.encryptionKey),
    marketData: Config.marketData,
    walletIndices: { neo: 0, eth: 0 }
  }

  const config = await initialize(params)
  expect(config.wallets.neo.publicKey).toBe(Config.wallets.neo.publicKey)
  expect(config.wallets.neo.privateKey).toBe(Config.wallets.neo.privateKey)
  expect(config.wallets.neo.address).toBe(Config.wallets.neo.address)

  expect(config.wallets.eth.publicKey).toBe(Config.wallets.eth.publicKey)
  expect(config.wallets.eth.privateKey).toBe(Config.wallets.eth.privateKey)
  expect(config.wallets.eth.address.toLowerCase()).toBe(Config.wallets.eth.address.toLowerCase())

  expect(config.payloadSigningKey).toEqual(Config.payloadSigningKey)
  expect(config.marketData).toEqual(Config.marketData)
  expect(config.assetData).toEqual(Config.assetData)
})
