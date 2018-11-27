import sign from './sign'

import getRSAKeysFromSecretKey from '../getRSAKeysFromSecretKey'
import getSecretKey from '../getSecretKey'

const message = 'hunter2'

test('takes a PrivateKey and a hash and returns a something', async () => {
  const rsa = await getRSAKeysFromSecretKey(getSecretKey())

  expect(sign(rsa.privateKey, message)).toEqual(expect.any(String))
})

test('is deterministic', async () => {
  const sk = getSecretKey()
  const rsa1 = await getRSAKeysFromSecretKey(sk)
  const rsa2 = await getRSAKeysFromSecretKey(sk)

  expect(sign(rsa1.privateKey, message)).toBe(sign(rsa2.privateKey, message))
})
