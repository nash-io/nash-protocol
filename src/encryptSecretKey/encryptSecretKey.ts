import { createCipheriv } from 'browserify-aes'

import randomBytes from '../randomBytes'
import AEAD from '../types/AEAD'

const NONCE_SIZE = 12

/**
 * Encrypts a secret key via AEAD. Returns an `AEAD` object. This object is
 * stored server-side, while the encryption key is never stored. When
 * authenticating, the server returns the `AEAD` object while the client must
 * generate the encryption key on the fly from the user's password using
 * `getHKDFKeyFromPassword.ts`.
 *
 * Uses [`aes-256-gcm`](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki).
 *
 * See `decryptSecretKey.ts`.
 */
export default function encryptSecretKey(encryptionKey: Buffer, secretKey: Buffer): AEAD {
  const nonce = randomBytes(NONCE_SIZE)

  const cipher = createCipheriv('aes-256-gcm', encryptionKey, nonce, {
    authTagLength: 16
  })

  const encryptedSecretKey = Buffer.concat([cipher.update(secretKey), cipher.final()])

  const tag = cipher.getAuthTag()

  return {
    encryptedSecretKey,
    nonce,
    tag
  }
}
