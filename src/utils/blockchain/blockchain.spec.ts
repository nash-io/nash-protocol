import { BuyOrSellBuy, BuyOrSellSell } from '../../payload'
import { getLimitPrice } from './blockchain'

test('unit rate conversion', async () => {
  let price = { amount: '0.00123000', currency_a: 'eth', currency_b: 'neo' }

  let result = getLimitPrice('eth_neo', BuyOrSellBuy, price, false).toFormat(8)

  expect(result).toBe('813.00813008')

  result = getLimitPrice('eth_neo', BuyOrSellSell, price, true).toFormat(8)
  expect(result).toBe(price.amount)

  price = { amount: '0.00128000', currency_a: 'eth', currency_b: 'neo' }
  result = getLimitPrice('eth_neo', BuyOrSellSell, price, true).toFormat(8)
  expect(result).toBe(price.amount)
  result = getLimitPrice('eth_neo', BuyOrSellBuy, price, false).toFormat(8)
  expect(result).toBe('781.25000000')

  price = { amount: '0.00124900', currency_a: 'eth', currency_b: 'neo' }
  result = getLimitPrice('eth_neo', BuyOrSellBuy, price, false).toFormat(8)
  expect(result).toBe('800.64051241')
})
