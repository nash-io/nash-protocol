import { generateNashPayloadSigningKey, generateWallet, CoinType } from './generateWallet'
import _ from 'lodash'
import testVectors from '../__tests__/testVectors.json'

test('generates deterministic BIP44 ETH keys', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')

    for (const wallet of vector.wallets.eth) {
      const genWallet = generateWallet(masterSeed, CoinType.ETH, wallet.index)
      expect(genWallet.address).toBe(wallet.address.toLowerCase())
      expect(genWallet.publicKey).toBe(wallet.publicKey)
      expect(genWallet.privateKey).toBe(wallet.privateKey)
      expect(genWallet.index).toBe(wallet.index)
    }
  }
})

test('generates deterministic BIP44 NEO keys', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')

    for (const wallet of vector.wallets.neo) {
      const genWallet = generateWallet(masterSeed, CoinType.NEO, wallet.index)
      expect(genWallet.address).toBe(wallet.address)
      expect(genWallet.publicKey).toBe(wallet.publicKey)
      expect(genWallet.privateKey).toBe(wallet.privateKey)
      expect(genWallet.index).toBe(wallet.index)
    }
  }
})

test('generates deterministic BIP44 BTC keys', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')

    for (const wallet of vector.wallets.btc) {
      const genWallet = generateWallet(masterSeed, CoinType.BTC, wallet.index)
      expect(genWallet.address).toBe(wallet.address)
      expect(genWallet.publicKey).toBe(wallet.publicKey)
      expect(genWallet.privateKey).toBe(wallet.privateKey)
      expect(genWallet.index).toBe(wallet.index)
    }
  }
})

// test('generates deterministic BIP44 LTC keys', async () => {
//   for (const vector of testVectors) {
//     const masterSeed = Buffer.from(vector.masterSeed, 'hex')

//     const genWallet = generateWallet(masterSeed, CoinType.LTC, 0)
//     console.info("LTC Wallet: ", genWallet)
//     // expect(genWallet.address).toBe(wallet.address)
//     // expect(genWallet.publicKey).toBe(wallet.publicKey)
//     // expect(genWallet.privateKey).toBe(wallet.privateKey)
//     // expect(genWallet.index).toBe(wallet.index)
//     //}
//   }
// })


test('generates deterministic payload signing key', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')
    const wallet = generateNashPayloadSigningKey(masterSeed, 0)

    expect(wallet.publicKey).toBe(vector.payloadSigningKey.publicKey)
    expect(wallet.address).toBe('')
    expect(wallet.privateKey).toBe(vector.payloadSigningKey.privateKey)
    expect(wallet.index).toBe(vector.payloadSigningKey.index)
  }
})
