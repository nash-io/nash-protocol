import stringify from './stringify'

import getSecretKey from '../getSecretKey'

test('stringifies a buffer as hex', () => {
  const buffer = getSecretKey()

  expect(buffer.toString('base64')).toBe(stringify(buffer))
})
