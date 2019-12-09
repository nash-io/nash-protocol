import { BuyOrSellBuy, BuyOrSellSell } from '../../payload'
import { getLimitPrice } from './blockchain'

test('unit rate conversion', async () => {
  let price = { amount: '0.00123', currency_a: 'eth', currency_b: 'neo' }

  let result = getLimitPrice('eth_neo', BuyOrSellBuy, price)

  expect(result).toBe('813.00813008')

  result = getLimitPrice('eth_neo', BuyOrSellSell, price)
  expect(result).toBe(price.amount)

  price = { amount: '0.00128', currency_a: 'eth', currency_b: 'neo' }
  result = getLimitPrice('eth_neo', BuyOrSellSell, price)
  expect(result).toBe(price.amount)
  result = getLimitPrice('eth_neo', BuyOrSellBuy, price)
  expect(result).toBe('781.25000000')
})
