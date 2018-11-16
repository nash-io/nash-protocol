import getEntropy from './getEntropy'

test('should return an object with keys "publicKey" and "secretKey", both of which are buffers', () => {
  const output = getEntropy()

  expect(Buffer.isBuffer(output.publicKey)).toBeTruthy()
  expect(Buffer.isBuffer(output.secretKey)).toBeTruthy()
})
