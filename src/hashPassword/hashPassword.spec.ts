import hashPassword from './hashPassword'

import stringify from '../stringify'

test('should properly hash a password', async () => {
  const password = 'hunter2'
  const salt = '123'
  const output = await hashPassword(password, salt)
  const expectation =
    '083b3928ff7d980743c71f991723bddee5c9d08c7323f8c4a0687b30d0b883bb'

  expect(stringify(output)).toBe(expectation)
})
