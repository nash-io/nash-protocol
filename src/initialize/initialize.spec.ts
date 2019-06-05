import { initialize } from './initialize'
import Config from '../__tests__/config.json'
import TestVectors from '../__tests__/testVectors.json'
import bufferize from '../bufferize'
import TestConfig from '../__tests__/config.json'

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
    walletConfig: { neo: 1, eth: 1 }
  }

  const config = await initialize(params)
  expect(config).toEqual(TestConfig)
})
