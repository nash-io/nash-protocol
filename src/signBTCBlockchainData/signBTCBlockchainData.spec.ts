import { signBTCMessage, signBTC } from './signBTCBlockchainData'
import config from '../__tests__/blockchain_config.json'
import testVectors from '../__tests__/signatureVectors.json'
import * as Bitcoin from 'bitcoinjs-lib'

test('sign btc arbitrary message', async () => {
  testVectors.messages.btc.forEach(message => {
    const signature = signBTCMessage(config.wallets.btc.privateKey, message.message)
    const expected = message.base64Signature
    expect(signature.signature).toEqual(expected)
  })
})

test('sign btc hash', async () => {
  testVectors.messages.btc.forEach(message => {
    const hash = Bitcoin.crypto.hash160(Buffer.from(message.message))
    const signature = signBTC(config.wallets.btc.privateKey, hash)
    const expected = message.signature
    expect(signature.signature).toEqual(expected)
  })
})
