import { toBigEndianHex, normalizeAmount } from './currency'

test('write a number to a big endian buffer', async () => {
  const testCases = [
    {
      amount: 100000,
      want: '00000000000186a0'
    },
    {
      amount: 84758748754,
      want: '00000013bc03de52'
    },
    {
      amount: 1012,
      want: '00000000000003f4'
    }
  ]

  for (const testCase of testCases) {
    expect(toBigEndianHex(testCase.amount)).toBe(testCase.want)
  }
})

test('normalizes a currency amount', async () => {
  const testCases = [
    { amount: '12', precision: 8, want: 1200000000 },
    { amount: '1.00', precision: 6, want: 1000000 },
    { amount: '1.1335566', precision: 4, want: 11335 },
    { amount: '1.5', precision: 2, want: 150 },
    { amount: '1.5', precision: 1, want: 15 },
    { amount: '1', precision: 0, want: 1 },
    { amount: '1', precision: 8, want: 100000000 },
    { amount: '0.123456', precision: 8, want: 12345600 },
    { amount: '15.', precision: 8, want: 1500000000 },
    { amount: '15.0', precision: 8, want: 1500000000 }
  ]

  for (const testCase of testCases) {
    expect(normalizeAmount(testCase.amount, testCase.precision)).toBe(testCase.want)
  }
})
