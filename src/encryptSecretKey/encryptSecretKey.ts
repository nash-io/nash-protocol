import { createCipheriv } from 'browserify-aes'
import randomBytes from 'randombytes'

import AEAD from '../types/AEAD'

const NONCE_SIZE = 12

// Reference: https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv_options
// tslint:disable:no-expression-statement
export default function encryptSecretKey(
  encryptionKey: Buffer,
  secretKey: Buffer
): AEAD {
  const nonce = randomBytes(NONCE_SIZE)

  // TODO: chose these based on recommended parameters, needs an audit!
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, nonce, {
    authTagLength: 16
  })

  // do we need additional authenticated data? what data should be used here?
  // cipher.setAAD(some known)

  const encryptedSecretKey = Buffer.concat([
    cipher.update(secretKey),
    cipher.final()
  ])

  const tag = cipher.getAuthTag()

  return {
    encryptedSecretKey,
    nonce,
    tag
  }
}
