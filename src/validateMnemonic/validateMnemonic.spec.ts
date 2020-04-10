import validateMnemonic from './validateMnemonic'

import getSecretKey from '../getSecretKey'
import secretKeyToMnemonic from '../secretKeyToMnemonic'

test('should return true for valid mnemonic', () => {
  const output = validateMnemonic(secretKeyToMnemonic(getSecretKey()))

  expect(output).toBeTruthy()
})

test('should return false for invalid mnemonic', () => {
  const output = validateMnemonic(['some', 'entirely', 'arbitrary', 'words', 'foo', 'bar', 'baz'])

  expect(output).toBeFalsy()
})
