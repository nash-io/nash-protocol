import bufferize from './bufferize'

import getSecretKey from '../getSecretKey'
import stringify from '../stringify'

test('bufferizes a string as hex', () => {
  const buffer = getSecretKey()

  expect(bufferize(stringify(buffer))).toEqual(buffer)
})
