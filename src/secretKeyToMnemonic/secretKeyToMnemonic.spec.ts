import secretKeyToMnemonic from './secretKeyToMnemonic'

import bufferize from '../bufferize'
import getSecretKey from '../getSecretKey'

import testVectors from '../__tests__/testVectors.json'

test('should be a 12-word phrase', () => {
  const secretKey = getSecretKey()
  const output = secretKeyToMnemonic(secretKey)

  expect(output).toHaveLength(12)
  expect(output).toEqual(expect.arrayContaining([expect.stringMatching(/\w+/)]))
})

testVectors.forEach((vector, idx) =>
  test(`passes test vector ${idx + 1}`, () => {
    const output = secretKeyToMnemonic(bufferize(vector.secretKey))

    expect(output).toHaveLength(12)
    expect(output).toEqual(vector.mnemonic)
  })
)
