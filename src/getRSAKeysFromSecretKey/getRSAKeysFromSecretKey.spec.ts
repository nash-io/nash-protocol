import getRSAKeysFromSecretKey from './getRSAKeysFromSecretKey'

import getEntropy from '../getEntropy'

test('deterministically generates RSA keys', async () => {
  const { secretKey } = getEntropy()

  const k1 = await getRSAKeysFromSecretKey(secretKey)
  const k2 = await getRSAKeysFromSecretKey(secretKey)

  expect(k1.privateKey.n.toString()).toEqual(k2.privateKey.n.toString())
  expect(k1.privateKey.e.toString()).toEqual(k2.privateKey.e.toString())
  expect(k1.privateKey.d.toString()).toEqual(k2.privateKey.d.toString())
  expect(k1.privateKey.p.toString()).toEqual(k2.privateKey.p.toString())
  expect(k1.privateKey.q.toString()).toEqual(k2.privateKey.q.toString())
  expect(k1.privateKey.dP.toString()).toEqual(k2.privateKey.dP.toString())
  expect(k1.privateKey.dQ.toString()).toEqual(k2.privateKey.dQ.toString())
  expect(k1.privateKey.qInv.toString()).toEqual(k2.privateKey.qInv.toString())

  expect(k1.publicKey.n.toString()).toEqual(k2.publicKey.n.toString())
  expect(k1.publicKey.e.toString()).toEqual(k2.publicKey.e.toString())
})

test.skip('can sign and verify messages', () => {
  // Not yet implemented
})
