import normalizeString from './normalizeString'

test('should take a string and return a buffer', () => {
  const output = normalizeString('foobar')
  const expectation = Buffer.from('foobar')

  expect(output.equals(expectation)).toBe(true)
})

test('properly normalize special characters', () => {
  const output1 = normalizeString('über')
  const output2 = normalizeString('\u00fcber') // ü as 1 char
  const output3 = normalizeString('u\u0308ber') // ü as ¨ + u

  expect(output1.equals(output2)).toBe(true)
  expect(output1.equals(output3)).toBe(true)
})
