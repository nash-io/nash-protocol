import regenerateMnemonic from './regenerateMnemonic'

import encryptSecretKey from '../encryptSecretKey'
import getHKDFKeysFromPassword from '../getHKDFKeysFromPassword'
import getSecretKey from '../getSecretKey'
import secretKeyToMnemonic from '../secretKeyToMnemonic'

test('regenerates mnemonic from an AEAD object', async () => {
  const password = 'hunter2'
  const salt = 'b0cd9948365b'
  const secretKey = getSecretKey()
  const { encryptionKey } = await getHKDFKeysFromPassword(password, salt)
  const aead = encryptSecretKey(encryptionKey, secretKey)

  const output = await regenerateMnemonic(aead, password, salt)
  const expectation = secretKeyToMnemonic(secretKey)

  expect(output).toEqual(expectation)
})
