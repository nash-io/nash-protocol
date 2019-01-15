import mnemonicToMasterSeed from './mnemonicToMasterSeed'

import getSecretKey from '../getSecretKey'
import secretKeyToMnemonic from '../secretKeyToMnemonic'
import stringify from '../stringify'

import testVectors from '../__tests__/testVectors.json'

test('should be a buffer', () => {
  const output = mnemonicToMasterSeed(secretKeyToMnemonic(getSecretKey()))

  expect(Buffer.isBuffer(output)).toBe(true)
})

testVectors.forEach((vector, idx) =>
  test(`passes test vector ${idx + 1}`, () => {
    const output = mnemonicToMasterSeed(vector.mnemonic)

    expect(stringify(output)).toBe(vector.masterSeed)
  })
)
