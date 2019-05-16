import { ec as EC } from 'elliptic'

import bufferize from '../bufferize'
import stringify from '../stringify'
import { SigningPayloadID } from './signingPayloadID'
import signPayload, { buildNEOBlockchainSignatureData, canonicalString } from './signPayload'

const privateKeyHex = '2304cae8deb223fbc6774964af6bc4fcda6ba6cff8276cb2c0f49fb0c8a51d57'
const privateKey = Buffer.from(privateKeyHex, 'hex')

test('get private key import behaves correctly', () => {
  const curve = new EC('secp256k1')
  const keypair = curve.keyFromPrivate(privateKey)
  const pubkey = keypair.getPublic().encode(true, 'hex')
  const out = stringify(bufferize(pubkey))
  expect(out).toBe('037e2bf05c0bcb67a0de3f285e855b0b538aa57006fc1caa0802b9e944f93b343a')
})

describe('canonical string()', () => {
  it('lowercases and stringifies', () => {
    const output = canonicalString({ FOO: 'FOO' })
    const expectation = '{"foo":"foo"}'

    expect(output).toBe(expectation)
  })

  it('deeply snake cases keys', () => {
    const output = canonicalString({
      deep: { willBeSnakeCased: 'willNotBeSnakeCased' },
      willBeSnakeCased: 'willNotBeSnakeCased'
    })
    const expectation =
      '{"deep":{"will_be_snake_cased":"willnotbesnakecased"},"will_be_snake_cased":"willnotbesnakecased"}'

    expect(output).toBe(expectation)
  })

  it('alphabetizes keys', () => {
    const output = canonicalString({ foo: true, bar: true })
    const expectation = '{"bar":true,"foo":true}'

    expect(output).toBe(expectation)
  })
})

test('serialize, hash, and sign get account balance payload', () => {
  const payload = {
    currency: 'eth',
    timestamp: 1552027305931
  }

  const payloadSignature = signPayload(privateKey, SigningPayloadID.getAccountBalancePayload, payload)
  expect(payloadSignature.signature).toBe(
    '304502210094d4f1d0436e308c50218361dc7854ec30f1ef93145b14671760dada53c5f1e0022059a6ac14c35e775398ecd130dfcde6dc359ba7a9fca8b59413d54aa88697aff8'
  )
})

test('serialize, hash, and sign get deposit address payload', () => {
  const payload = { currency: 'neo', timestamp: 1552027306271 }

  const payloadSignature = signPayload(privateKey, SigningPayloadID.getDepositAddressPayload, payload)
  expect(payloadSignature.signature).toBe(
    '3044022025c43614439598ab3855fd59103fa8e83f0dfb4418a923481114e5bc3f4201d602205a02cc3c3ccd54a4ca9e7aed7c5cafab82bd942eba22929f2e50ddb47d814883'
  )
})

test('serialize, hash, and sign list movements payload', () => {
  const payload = { timestamp: 1552027307783 }
  const payloadSignature = signPayload(privateKey, SigningPayloadID.listMovementsPayload, payload)
  expect(payloadSignature.signature).toBe(
    '304402207e32a01d90325c0e805f7444ad6072b5346ed53caffee8bc036c22e394f4688302202ecf88557ae669de629193c685ed1f4d48e51a77e7e370371121b3d616782016'
  )
})

test('serialize, hash, and sign list account balances payload', () => {
  const payload = { ignore_low_balance: false, timestamp: 1552027306572 }

  const payloadSignature = signPayload(privateKey, SigningPayloadID.listAccountBalancePayload, payload)
  expect(payloadSignature.signature).toBe(
    '3045022100c6620f44e314adf6adae70c5964b0c0cedd0ac27f66ad0cbdec5beed8008f8f202202ba7a754c2b7c6d08f11533fef884ddb9d09b5210b668d0fafa83efeffa44716'
  )
})

test('serialize, hash, and sign list account volumes payload', () => {
  const payload = { timestamp: 1552027307483 }

  const payloadSignature = signPayload(privateKey, SigningPayloadID.listAccountVolumesPayload, payload)
  expect(payloadSignature.signature).toBe(
    '3045022100b3f97d5c0fdfc1cc703de90aafd255846cffca4e968b7cafb7468c3491593e29022053464a5583a18ab1b975fd31610f3152e7ef230cacc47719075e4efabd19806e'
  )
})

test('serialize, hash, and sign list account orders payload', () => {
  const payload = { timestamp: 1552027307101 }

  const payloadSignature = signPayload(privateKey, SigningPayloadID.listOrderPayload, payload)
  expect(payloadSignature.signature).toBe(
    '304502210094e709789a11dcb1404d7d66d8d9db11b7173a19bd1bdadab8e09c46c0208a6802207d8f726b7cc7d48c4efd27b02f730339426073da9a6ac98e4a4f97d120f60300'
  )
})

// 01fd783cc6b77e38f6ad89af019cfdd1a6fc95e4d3e72d286979ee6cb1b7e65dfddfb2e384100b8d148e7758de42e4168b71792c609b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc50300000000000000010000000000000080969800000000000000000000000000ffffffffffffffff90d00300000000000200000000000000039fcee26c1f54024d19c0affcf6be8187467c9ba4749106a4b897a08b9e8fed23

const config = {
  assetData: {
    gas: {
      blockchain: 'neo',
      hash: '602C79718B16E442DE58778E148D0B1084E3B2DFFD5DE6B7B16CEE7969282DE7',
      precision: 8
    },
    neo: {
      blockchain: 'neo',
      hash: 'C56F33FC6ECFCD0C225C4AB356FEE59390AF8560BE0E930FAEBE74A6DAFF7C9B',
      precision: 8
    }
  },
  marketData: {},
  wallets: {
    neo: {
      address: 'Aet6eGnQMvZ2xozG3A3SvWrMFdWMvZj1cU',
      privateKey: '7146c0beb313d849809a263d3e112b7c14801c381ddc8b793ab751d451886716',
      publicKey: '039fcee26c1f54024d19c0affcf6be8187467c9ba4749106a4b897a08b9e8fed23'
    }
  }
}

test('NEO blockchain data market_order_payload', () => {
  const payload = {
    amount: { amount: '10.123456', currency: 'neo' },
    buyOrSell: 'BUY',
    market: 'gas_neo',
    nonceFrom: 0,
    nonceOrder: 0,
    nonceTo: 0,
    timestamp: 1551452048302
  }

  const data = buildNEOBlockchainSignatureData(config, { kind: SigningPayloadID.placeMarketOrderPayload, payload })
  const want =
    '01fd783cc6b77e38f6ad89af019cfdd1a6fc95e4d3e72d286979ee6cb1b7e65dfddfb2e384100b8d148e7758de42e4168b71792c609b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc500000000000000000000000000000000c0789a00000000000000000000000000ffffffffffffffff90d00300000000000000000000000000039fcee26c1f54024d19c0affcf6be8187467c9ba4749106a4b897a08b9e8fed23'

  console.log('====================================')
  console.log(Number(payload.amount.amount))
  console.log(data.length)
  console.log(data)
  console.log(want.length)
  console.log('====================================')

  expect(data).toBe(want)
})

import { toLittleEndian } from './signPayload'
test('to little endian', async () => {
  const amount = 18446744073709551615
  console.log(toLittleEndian(amount))
})

// test('serialize, hash and sign place_market_order payload', () => {
//   const payload = {
//     amount: { amount: '10.00', currency: 'neo' },
//     buyOrSell: 'SELL',
//     market: 'neo_gas',
//     nonce: 1,
//     nonceFrom: 3,
//     nonceOrder: 4,
//     nonceTo: 2,
//     timestamp: 1552027307101
//   }

//   const payloadSignature = signPayload(privateKey, SigningPayloadID.placeMarketOrderPayload, payload)

//   expect(payloadSignature).toBeFalsy()
// })
