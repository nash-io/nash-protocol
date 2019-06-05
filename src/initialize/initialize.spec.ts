import { initialize } from './initialize'
import Config from '../__tests__/config.json'
import TestVectors from '../__tests__/testVectors.json'
import bufferize from '../bufferize'

const vector = TestVectors[0]

test('initializes a config object', async () => {
  const params = {
    encryptionKey: bufferize(vector.encryptionKey),
    aead: {
      encryptedSecretKey: bufferize(vector.encryptedSecretKey),
      tag: bufferize(vector.tag),
      nonce: bufferize(vector.nonce)
    },
    marketData: Config.marketData,
    assetData: Config.assetData,
    walletConfig: { neo: 1, eth: 1 }
  }

  const config = await initialize(params)
  console.log(config)
})
