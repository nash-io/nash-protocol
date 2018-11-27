import sigVerify from './sigVerify'

import getRSAKeysFromSecretKey from '../getRSAKeysFromSecretKey'
import getSecretKey from '../getSecretKey'
import sign from '../sign'

const message = 'hunter2'

test('verifies signatures', async () => {
  const rsa = await getRSAKeysFromSecretKey(getSecretKey())
  const signature = sign(rsa.privateKey, message)

  expect(sigVerify(rsa.publicKey, message, signature)).toBe(true)
})
