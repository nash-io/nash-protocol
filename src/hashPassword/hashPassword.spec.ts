import hashPassword from './hashPassword'

import stringify from '../stringify'

test('should properly hash a password', async () => {
  const password = 'hunter2'
  const salt = '123'
  const output = await hashPassword(password, salt)
  const expectation = 'VjOakzmGUxZ1TVU5xBV9Xd6eNjqejZ58mN1EAn4Q9ZQ='

  expect(stringify(output)).toBe(expectation)
})
