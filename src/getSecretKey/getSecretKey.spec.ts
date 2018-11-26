import getSecretKey from './getSecretKey'

test('should return a buffer with length 16', () => {
  const secretKey = getSecretKey()

  expect(Buffer.isBuffer(secretKey)).toBeTruthy()
  expect(secretKey).toHaveLength(16)
})
