import { signBTCMessage } from './signBTCBlockchainData'
import config from '../__tests__/blockchain_config.json'
import testVectors from '../__tests__/signatureVectors.json'

test('sign btc arbitrary message', async () => {
  testVectors.messages.btc.forEach(message => {
    const signature = signBTCMessage(config.wallets.btc.privateKey, message.message)
    const expected = message.signature
    expect(signature.signature).toEqual(expected)
  })
})
