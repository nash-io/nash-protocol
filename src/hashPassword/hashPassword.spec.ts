import hashPassword from './hashPassword'

test('should properly hash a password', async () => {
  const password = 'hunter2'
  const userID = '123'
  const output = await hashPassword(password, userID)
  const expectation =
    '083b3928ff7d980743c71f991723bddee5c9d08c7323f8c4a0687b30d0b883bb'

  expect(output.toString('hex')).toBe(expectation)
})
