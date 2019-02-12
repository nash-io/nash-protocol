import mnemonicToSecretKey from './mnemonicToSecretKey'

import getSecretKey from '../getSecretKey'
import secretKeyToMnemonic from '../secretKeyToMnemonic'

test('should regenerate secret key', () => {
  const secretKey = getSecretKey()
  const output = mnemonicToSecretKey(secretKeyToMnemonic(secretKey))

  expect(output).toEqual(secretKey)
})
