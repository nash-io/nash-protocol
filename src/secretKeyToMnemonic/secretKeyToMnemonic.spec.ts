import secretKeyToMnemonic from './secretKeyToMnemonic'

import getSecretKey from '../getSecretKey'

test('should be a 12-word phrase', () => {
  const secretKey = getSecretKey()
  const output = secretKeyToMnemonic(secretKey)

  expect(output).toHaveLength(12)
  expect(output).toEqual(expect.arrayContaining([expect.stringMatching(/\w+/)]))
})
