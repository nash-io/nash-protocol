import encryptSecretKey from './encryptSecretKey'

import getHKDFKeysFromPassword from '../getHKDFKeysFromPassword'

test('returns an AEAD object', async () => {
  const password = 'hunter2'
  const salt = 'b0cd9948365b'
  const { encryptionKey } = await getHKDFKeysFromPassword(password, salt)
  const secretKey = Buffer.from('8e89b54cc934ac2965101e194d7f0c09', 'hex')

  const output = encryptSecretKey(encryptionKey, secretKey)

  // AES-CBC is not deterministic so we only test for shape
  expect(output).toEqual(
    expect.objectContaining({
      encryptedSecretKey: expect.any(Buffer),
      nonce: expect.any(Buffer),
      tag: expect.any(Buffer)
    })
  )
})
