import mnemonicToMasterSeed from './mnemonicToMasterSeed'

import getEntropy from '../getEntropy'
import secretKeyToMnemonic from '../secretKeyToMnemonic'

// TODO: how to reasonably test this?
test('should be a buffer', () => {
  const output = mnemonicToMasterSeed(
    secretKeyToMnemonic(getEntropy().secretKey)
  )

  expect(Buffer.isBuffer(output)).toBe(true)
})
