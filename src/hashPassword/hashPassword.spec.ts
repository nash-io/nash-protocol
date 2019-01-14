import hashPassword from './hashPassword'

import stringify from '../stringify'

test('should properly hash a password', async () => {
  const password = 'hunter2'
  const salt = 'b0cd9948365b'
  const output = await hashPassword(password, salt)
  const expectation =
    'bd38c1f44bfc5e6d0ac281c9b87cbd97e5a79134c960d856e4268fe2ca16f5e9'

  expect(stringify(output)).toBe(expectation)
})
