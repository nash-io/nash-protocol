import mnemonicToMasterSeed from './mnemonicToMasterSeed'

import getSecretKey from '../getSecretKey'
import secretKeyToMnemonic from '../secretKeyToMnemonic'

// TODO: how to reasonably test this?
test('should be a buffer', () => {
  const output = mnemonicToMasterSeed(secretKeyToMnemonic(getSecretKey()))

  expect(Buffer.isBuffer(output)).toBe(true)
})
