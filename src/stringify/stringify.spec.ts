import stringify from './stringify'

import getEntropy from '../getEntropy'

test('stringifies a buffer as hex', () => {
  const buffer = getEntropy().secretKey

  expect(buffer.toString('hex')).toBe(stringify(buffer))
})
