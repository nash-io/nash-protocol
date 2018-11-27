import hashPassword from './hashPassword'

import stringify from '../stringify'

test('should properly hash a password', async () => {
  const password = 'hunter2'
  const salt = '123'
  const output = await hashPassword(password, salt)
  const expectation =
    '56339a9339865316754d5539c4157d5dde9e363a9e8d9e7c98dd44027e10f594'

  expect(stringify(output)).toBe(expectation)
})
