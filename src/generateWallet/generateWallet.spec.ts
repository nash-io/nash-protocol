import { generateNashPayloadSigningKey, generateWallet, CoinType } from './generateWallet'
import _ from 'lodash'
import testVectors from '../__tests__/testVectors.json'
import { Blockchain } from '../types'

test('generates deterministic BIP44 ETH keys', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')

    for (const wallet of vector.wallets.eth) {
      const genWallet = await generateWallet(masterSeed, CoinType.ETH, wallet.index)
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
    let wallet = await generateWallet(masterSeed, CoinType.ETH, 1)
    expect(wallet.address).toBe(walletOneIndex.address.toLowerCase())

    // with non legacy index, ETH should use wallet with index 0
    wallet = await generateWallet(masterSeed, CoinType.ETH, 0)
    expect(wallet.address).toBe(walletZeroIndex.address.toLowerCase())

    // with a legacy index, MATIC should not be the same as ETH wallet
    wallet = await generateWallet(masterSeed, CoinType.POLYGON, 1)
    expect(wallet.address).not.toBe(walletOneIndex.address.toLowerCase())

    // with non legacy index, MATIC should be the same as the eth wallet
    wallet = await generateWallet(masterSeed, CoinType.POLYGON, 0)
    expect(wallet.address).toBe(walletZeroIndex.address.toLowerCase())

    // same with Arbitrum, mantle, etc
    wallet = await generateWallet(masterSeed, CoinType.MANTLE, 0)
    expect(wallet.address).toBe(walletZeroIndex.address.toLowerCase())
    wallet = await generateWallet(masterSeed, CoinType.ABRITRUM, 0)
    expect(wallet.address).toBe(walletZeroIndex.address.toLowerCase())
    wallet = await generateWallet(masterSeed, CoinType.OPTIMISM, 0)
    expect(wallet.address).toBe(walletZeroIndex.address.toLowerCase())
  }
})

test('generates deterministic BIP44 NEO keys', async () => {
  for (const vector of testVectors) {
    const masterSeed = Buffer.from(vector.masterSeed, 'hex')

    for (const wallet of vector.wallets.neo) {
      const genWallet = await generateWallet(masterSeed, CoinType.NEO, wallet.index)
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
      const genWallet = await generateWallet(masterSeed, CoinType.NEO, wallet.index, '', Blockchain.NEO3)
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
      const genWallet = await generateWallet(masterSeed, CoinType.BTC, wallet.index)
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

    const genWallet = await generateWallet(masterSeed, CoinType.LTC, ltc.index, 'MainNet')
    expect(genWallet.address).toBe(ltc.address)
    expect(genWallet.publicKey).toBe(ltc.publicKey)
    expect(genWallet.privateKey).toBe(ltc.privateKey)
    expect(genWallet.index).toBe(ltc.index)

    const ltcTestnet = vector.wallets.ltc.TestNet
    const testnetWallet = await generateWallet(masterSeed, CoinType.LTC, ltc.index, 'TestNet')
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

    const genWallet = await generateWallet(masterSeed, CoinType.DOGE, wallet.index, 'MainNet')
    expect(genWallet.address).toBe(wallet.address)
    expect(genWallet.publicKey).toBe(wallet.publicKey)
    expect(genWallet.privateKey).toBe(wallet.privateKey)
    expect(genWallet.index).toBe(wallet.index)

    const testWallet = vector.wallets.doge.TestNet
    const testnetWallet = await generateWallet(masterSeed, CoinType.DOGE, testWallet.index, 'TestNet')
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

    const genWallet = await generateWallet(masterSeed, CoinType.BCH, wallet.index, 'MainNet')
    expect(genWallet.address).toBe(wallet.address)
    expect(genWallet.publicKey).toBe(wallet.publicKey)
    expect(genWallet.privateKey).toBe(wallet.privateKey)
    expect(genWallet.index).toBe(wallet.index)

    const testWallet = vector.wallets.bch.TestNet
    const testnetWallet = await generateWallet(masterSeed, CoinType.BCH, testWallet.index, 'TestNet')
    expect(testnetWallet.address).toBe(testWallet.address)
    expect(testnetWallet.publicKey).toBe(testWallet.publicKey)
    expect(testnetWallet.privateKey).toBe(testWallet.privateKey)
    expect(testnetWallet.index).toBe(testWallet.index)
  }
})

test('generates deterministic BIP44 Solana keys', async () => {
  const vector = testVectors[0]
  const masterSeed = Buffer.from(vector.masterSeed, 'hex')
  const genWallet = await generateWallet(masterSeed, CoinType.SOLANA, 0)
  expect(genWallet).toEqual({
    address: 'B2K4FuAJx3jCe3RPghHHHwrAgE3F6trWFVasRrFc1x84',
    index: 0,
    privateKey: 'b0dc40c37d54540ce04971549b897f7e4506dc54317348078860183ab0cd0fb1',
    publicKey: '94eaddc14166806d7b1a8cfcbab03fb1f5d40a79b868451c3a970eaa68c7b685'
  })

  const genWalletAgain = await generateWallet(masterSeed, CoinType.SOLANA, 1)
  expect(genWalletAgain).toEqual({
    address: 'DFyWTvEvEFXeKDD74w6DnhXwoTworwErynaQry21U8tu',
    index: 1,
    privateKey: '3ef7698d6840c3fcb5e4b75c6b24e048a7096ff85070d73c31b7b8d64a436d11',
    publicKey: 'b62244abad13dad07e3c08bf43ee002bb77b077d81f47b0f7f2dc613a2bef516'
  })
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
