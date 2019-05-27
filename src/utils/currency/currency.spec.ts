import { toBigEndian } from './currency'
import _ from 'lodash'

test('write a number to a big endian buffer', async () => {
  const testCases = [
    {
      amount: 100000,
      want: '00000000000186a0'
    },
    {
      amount: 84758748754,
      want: '00000013bc03de52'
    }
  ]

  for (const testCase of testCases) {
    expect(toBigEndian(testCase.amount).toString('hex')).toBe(testCase.want)
  }
})
