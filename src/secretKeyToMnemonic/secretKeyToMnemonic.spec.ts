import secretKeyToMnemonic from './secretKeyToMnemonic'

import getEntropy from '../getEntropy'

test('should be a 12-word phrase', () => {
  const { secretKey } = getEntropy()
  const output = secretKeyToMnemonic(secretKey)

  expect(output).toHaveLength(12)
  expect(output).toEqual(expect.arrayContaining([expect.stringMatching(/\w+/)]))
})
