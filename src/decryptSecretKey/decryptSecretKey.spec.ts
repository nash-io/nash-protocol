import decryptSecretKey from '../decryptSecretKey'
import randomBytes from '../randomBytes'

import bufferize from '../bufferize'
import encryptSecretKey from '../encryptSecretKey'
import getHKDFKeysFromPassword from '../getHKDFKeysFromPassword'
import stringify from '../stringify'

import testVectors from '../__tests__/testVectors.json'

const password = 'hunter2'
const salt = 'b0cd9948365b'
const secretKey = Buffer.from('secretKey')

test('returns secret key when given correct encryption key', async () => {
  const { encryptionKey } = await getHKDFKeysFromPassword(password, salt)
  const aead = encryptSecretKey(encryptionKey, secretKey)

  const output = await decryptSecretKey(encryptionKey, aead)

  expect(output.equals(secretKey)).toBe(true)
})

/*
  Jest doesn't recognize awaiting a promise rejection as a thrown error.
  Therefore we do a hack to assert that an error is being thrown.
 */
describe('when given incorrect values', () => {
  const AUTH_ERROR_MSG = 'Unsupported state or unable to authenticate data'

  it('fails when given incorrect encryption key', async () => {
    const { encryptionKey } = await getHKDFKeysFromPassword(password, salt)
    const aead = encryptSecretKey(encryptionKey, secretKey)

    const {
      encryptionKey: incorrectEncryptionKey
    } = await getHKDFKeysFromPassword('wrong password', salt)

    try {
      const output = await decryptSecretKey(incorrectEncryptionKey, aead)
      expect(true).toBe(false)
      return output
    } catch (e) {
      return expect(e.message).toBe(AUTH_ERROR_MSG)
    }
  })

  it('fails when given incorrect tag key', async () => {
    const { encryptionKey } = await getHKDFKeysFromPassword(password, salt)
    const aead = encryptSecretKey(encryptionKey, secretKey)

    const {
      encryptionKey: incorrectEncryptionKey
    } = await getHKDFKeysFromPassword('wrong password', salt)
    const { tag: incorrectTag } = encryptSecretKey(
      incorrectEncryptionKey,
      secretKey
    )

    try {
      const output = await decryptSecretKey(incorrectEncryptionKey, {
        ...aead,
        tag: incorrectTag
      })
      expect(true).toBe(false)
      return output
    } catch (e) {
      return expect(e.message).toBe(AUTH_ERROR_MSG)
    }
  })

  it('fails when given incorrect nonce', async () => {
    const { encryptionKey } = await getHKDFKeysFromPassword(password, salt)
    const aead = encryptSecretKey(encryptionKey, secretKey)

    try {
      const output = await decryptSecretKey(encryptionKey, {
        ...aead,
        nonce: randomBytes(12)
      })
      expect(true).toBe(false)
      return output
    } catch (e) {
      return expect(e.message).toBe(AUTH_ERROR_MSG)
    }
  })
})

testVectors.forEach((vector, idx) =>
  test(`passes test vector ${idx + 1}`, async () => {
    const output = await decryptSecretKey(bufferize(vector.encryptionKey), {
      encryptedSecretKey: bufferize(vector.encryptedSecretKey),
      nonce: bufferize(vector.nonce),
      tag: bufferize(vector.tag)
    })

    expect(stringify(output)).toEqual(vector.secretKey)
  })
)
