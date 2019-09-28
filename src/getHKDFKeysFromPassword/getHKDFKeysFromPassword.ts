import hkdf from 'futoin-hkdf'
import hashPassword from '../hashPassword'
import HKDFKeys from '../types/HKDFKeys'

/*
  HKDF parameters
 */
const length = 32
const hash = 'SHA-256'

/**
 * Derives two keys from a given input key via
 * [HKDF](https://en.wikipedia.org/wiki/HKDF).
 *
 * Specifically, we use this to derive keys from a user's hashed password and
 * never use the hashed password directly. Thus, if one derived key is
 * compromised, other keys are not affected.
 *
 * See the `HKDFKeys` interface for information on how Nash uses these keys.
 */
export default async function getHKDFKeysFromPassword(password: string, salt: string): Promise<HKDFKeys> {
  const hashed = await hashPassword(password, salt)

  return {
    authKey: hkdf(hashed, length, { hash, info: 'auth', salt }),
    encryptionKey: hkdf(hashed, length, { hash, info: 'encryption', salt })
  }
}
