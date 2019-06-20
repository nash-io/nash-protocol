import hkdf from 'futoin-hkdf'
/*
  HKDF seems easy enough to implement on top of crypto.createHmac which would
  allow us to reduce external dependencies.
  https://en.wikipedia.org/wiki/HKDF#Example:_Python_implementation
 */
import hashPassword from '../hashPassword'
import HKDFKeys from '../types/HKDFKeys'

/*
  HKDF parameters
 */
// TODO: We're expanding the key here right? The scrypted key is already len=32. Do we want this to be longer?
const length = 32
const hash = 'SHA-256'

export default async function getHKDFKeysFromPassword(password: string, salt: string): Promise<HKDFKeys> {
  const hashed = await hashPassword(password, salt)

  // TODO: do we need to salt here again? If the original input is already hashed we shouldn't need to salt again right?
  // Does it matter?
  return {
    authKey: hkdf(hashed, length, { hash, info: 'auth', salt }),
    encryptionKey: hkdf(hashed, length, { hash, info: 'encryption', salt })
  }
}
