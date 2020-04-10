import stringify from './stringify'

import getSecretKey from '../getSecretKey'

test('stringifies a buffer as hex', () => {
  const buffer = getSecretKey()

  expect(buffer.toString('hex')).toBe(stringify(buffer))
})
