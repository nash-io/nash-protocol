import asyncScrypt from 'scrypt-async'

import normalizeString from '../utils/normalizeString'

/*
  Scrypt parameters

  Suggested N is 2^20 === 1048576. However this takes unacceptably long; using
  2^16 === 65536 is acceptable.
 */
const N = 2 ** 16
const r = 8
const p = 1
const dkLen = 32

/**
 * Hashes a plaintext password via the
 * [scrypt key derivation function](https://en.wikipedia.org/wiki/Scrypt).
 */
export default async function hashPassword(password: string, salt: string): Promise<Buffer> {
  return new Promise(res =>
    asyncScrypt(normalizeString(password), normalizeString(salt), { N, r, p, dkLen }, (key: string) => {
      // Progress tracker unhandled, we can incorporate it later if needed
      if (key) {
        return res(Buffer.from(key))
      }
    })
  )
}
