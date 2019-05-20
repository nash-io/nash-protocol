import { normalizeAmountForMarketPrecision } from './normalizeAmount'

test('normalizes the amount based on the precision', async () => {
  const amount = '1.5'
  const want = '150'
  const out = normalizeAmountForMarketPrecision(amount, 2)
  expect(out).toBe(want)
})
