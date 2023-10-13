import { scrypt, syncScrypt } from 'scrypt-js'

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
  return Buffer.from(await scrypt(normalizeString(password), normalizeString(salt), N, r, p, dkLen))
}

export function syncHashPassword(password: string, salt: string): Buffer {
  return Buffer.from(syncScrypt(normalizeString(password), normalizeString(salt), N, r, p, dkLen))
}
