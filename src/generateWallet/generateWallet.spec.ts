import { generateNashPayloadSigningKey, generateWallet, CoinType } from './generateWallet'
import _ from 'lodash'
import testVectors from '../__tests__/testVectors.json'
import { Blockchain } from '../types'

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

test('generates deterministic BIP44 EVM keys', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')

    const walletZeroIndex = vector.wallets.evm[0]
    const walletOneIndex = vector.wallets.evm[1]

    // with a legacy index, ETH should use wallet with index 1
    let wallet = generateWallet(masterSeed, CoinType.ETH, 1)
    expect(wallet.address).toBe(walletOneIndex.address.toLowerCase())

    // with non legacy index, ETH should use wallet with index 0
    wallet = generateWallet(masterSeed, CoinType.ETH, 0)
    expect(wallet.address).toBe(walletZeroIndex.address.toLowerCase())

    // with a legacy index, MATIC should not be the same as ETH wallet
    wallet = generateWallet(masterSeed, CoinType.POLYGON, 1)
    expect(wallet.address).not.toBe(walletOneIndex.address.toLowerCase())

    // with non legacy index, MATIC should be the same as the eth wallet
    wallet = generateWallet(masterSeed, CoinType.POLYGON, 0)
    expect(wallet.address).toBe(walletZeroIndex.address.toLowerCase())

    // same with Arbitrum, mantle, etc
    wallet = generateWallet(masterSeed, CoinType.MANTLE, 0)
    expect(wallet.address).toBe(walletZeroIndex.address.toLowerCase())
    wallet = generateWallet(masterSeed, CoinType.ABRITRUM, 0)
    expect(wallet.address).toBe(walletZeroIndex.address.toLowerCase())
    wallet = generateWallet(masterSeed, CoinType.OPTIMISM, 0)
    expect(wallet.address).toBe(walletZeroIndex.address.toLowerCase())
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

test('generates deterministic BIP44 NEO3 keys', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')

    for (const wallet of vector.wallets.neo3) {
      const genWallet = generateWallet(masterSeed, CoinType.NEO, wallet.index, '', Blockchain.NEO3)
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

test('generates deterministic BIP44 LTC keys', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')
    const ltc = vector.wallets.ltc.MainNet

    const genWallet = generateWallet(masterSeed, CoinType.LTC, ltc.index, 'MainNet')
    expect(genWallet.address).toBe(ltc.address)
    expect(genWallet.publicKey).toBe(ltc.publicKey)
    expect(genWallet.privateKey).toBe(ltc.privateKey)
    expect(genWallet.index).toBe(ltc.index)

    const ltcTestnet = vector.wallets.ltc.TestNet
    const testnetWallet = generateWallet(masterSeed, CoinType.LTC, ltc.index, 'TestNet')
    expect(testnetWallet.address).toBe(ltcTestnet.address)
    expect(testnetWallet.publicKey).toBe(ltcTestnet.publicKey)
    expect(testnetWallet.privateKey).toBe(ltcTestnet.privateKey)
    expect(testnetWallet.index).toBe(ltcTestnet.index)
  }
})

test('generates deterministic BIP44 doge keys', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')
    const wallet = vector.wallets.doge.MainNet

    const genWallet = generateWallet(masterSeed, CoinType.DOGE, wallet.index, 'MainNet')
    expect(genWallet.address).toBe(wallet.address)
    expect(genWallet.publicKey).toBe(wallet.publicKey)
    expect(genWallet.privateKey).toBe(wallet.privateKey)
    expect(genWallet.index).toBe(wallet.index)

    const testWallet = vector.wallets.doge.TestNet
    const testnetWallet = generateWallet(masterSeed, CoinType.DOGE, testWallet.index, 'TestNet')
    expect(testnetWallet.address).toBe(testWallet.address)
    expect(testnetWallet.publicKey).toBe(testWallet.publicKey)
    expect(testnetWallet.privateKey).toBe(testWallet.privateKey)
    expect(testnetWallet.index).toBe(testWallet.index)
  }
})

test('generates deterministic BIP44 bitcoincash keys', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')
    const wallet = vector.wallets.bch.MainNet

    const genWallet = generateWallet(masterSeed, CoinType.BCH, wallet.index, 'MainNet')
    expect(genWallet.address).toBe(wallet.address)
    expect(genWallet.publicKey).toBe(wallet.publicKey)
    expect(genWallet.privateKey).toBe(wallet.privateKey)
    expect(genWallet.index).toBe(wallet.index)

    const testWallet = vector.wallets.bch.TestNet
    const testnetWallet = generateWallet(masterSeed, CoinType.BCH, testWallet.index, 'TestNet')
    expect(testnetWallet.address).toBe(testWallet.address)
    expect(testnetWallet.publicKey).toBe(testWallet.publicKey)
    expect(testnetWallet.privateKey).toBe(testWallet.privateKey)
    expect(testnetWallet.index).toBe(testWallet.index)
  }
})

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
