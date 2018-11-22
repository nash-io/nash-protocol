import randomBytes from './randomBytes'

test('returns a buffer with length n', () => {
  const expectation = 16
  const output = randomBytes(expectation)

  expect(output).toHaveLength(expectation)
})
