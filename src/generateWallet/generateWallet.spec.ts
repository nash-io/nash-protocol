import { generateWallet, CoinType } from './generateWallet'
import _ from 'lodash'

const masterSeed = Buffer.from(
  '81e2ce3456affaed1512f7607171218ed5c978e03b531b9f798b91c8799f8c771366844b19d2daea371ae54420c3ee16205109ab1118d762124cfc8ad4fb5098',
  'hex'
)

const ethWallets = [
  {
    address: '0x55D16CA38dFB219141Ab6617B2872B978aF84702',
    index: 0,
    privateKey: '0b7561f1c775ef4715accd21aac8629bcda2e6eb4e434c0d55c917bd7c297ac6',
    publicKey: '02be641c583207c310739a23973fb7cb7336d2b835517ede791e9fa53fa5b0fc46'
  },
  {
    address: '0xcA7E5135e04371D048A78C4592BA3b61A984B563',
    index: 1,
    privateKey: 'e537b63096749e62e509ef4e849f739bff129baeeb100d131a681682422392cf',
    publicKey: '0375f8a0f4eda35b7194d265df33720cf80164f196765980fae29795f713b340d9'
  }
]

const neoWallets = [
  {
    address: 'Aet6eGnQMvZ2xozG3A3SvWrMFdWMvZj1cU',
    index: 0,
    privateKey: '491aac461bd2e0eb02ffe6cdb534a03617e8811764e4eea042f24231ba99b76f',
    publicKey: '033592dadd81e422d30909370f73f71028d34ddd9574bba9359986efa6d4037c8d'
  }
]

const btcWallets = [
  {
    address: '13Y7cKp41q2WGa8zCa7awdPaE6NmVhNqTp',
    index: 0,
    net: 'MainNet',
    privateKey: '3a36746814d81d30f8a5d66ca85657f5455a73e34cb085465279bc989a30b337',
    publicKey: '02a15776a6856857d13d7d8f2e4b1f45e0fca58dbeb132ab9b2dcbbb13102ab693'
  },
  {
    address: 'mohZhfr5cczu8ct3S3CF2M1fjr8AbAejoD',
    index: 1,
    net: 'TestNet',
    privateKey: '5f0e49c491eb0ba66f6d2ae60f0839157f47738feafe100496b172f21c817d40',
    publicKey: '025168d87f8c19200516401c94c84496b8456f31fc9b9fcdae622241a06ff81ba7'
  }
]

test('generates deterministic BIP44 ETH keys', async () => {
  for (const wallet of ethWallets) {
    const genWallet = generateWallet(masterSeed, CoinType.ETH, wallet.index)
    expect(genWallet.publicKey).toBe(wallet.publicKey)
    expect(genWallet.privateKey).toBe(wallet.privateKey)
  }
})

test('generates deterministic BIP44 NEO keys', async () => {
  for (const wallet of neoWallets) {
    const genWallet = generateWallet(masterSeed, CoinType.NEO, wallet.index)
    expect(genWallet.publicKey).toBe(wallet.publicKey)
    expect(genWallet.privateKey).toBe(wallet.privateKey)
  }
})

test('generates deterministic BIP44 BTC keys', async () => {
  for (const wallet of btcWallets) {
    const genWallet = generateWallet(masterSeed, CoinType.BTC, wallet.index, wallet.net)
    expect(genWallet.publicKey).toBe(wallet.publicKey)
    expect(genWallet.privateKey).toBe(wallet.privateKey)
  }
})
