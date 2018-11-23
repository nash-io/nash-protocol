import regenerateMnemonic from './regenerateMnemonic'

import encryptSecretKey from '../encryptSecretKey'
import getEntropy from '../getEntropy'
import getHKDFKeysFromPassword from '../getHKDFKeysFromPassword'
import secretKeyToMnemonic from '../secretKeyToMnemonic'

test('regenerates mnemonic from an AEAD object', async () => {
  const password = 'hunter2'
  const salt = '123'
  const { secretKey } = getEntropy()
  const { encryptionKey } = await getHKDFKeysFromPassword(password, salt)
  const aead = encryptSecretKey(encryptionKey, secretKey)

  const output = await regenerateMnemonic(aead, password, salt)
  const expectation = secretKeyToMnemonic(secretKey)

  expect(output).toEqual(expectation)
})
