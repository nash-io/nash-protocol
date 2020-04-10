import decryptSecretKey from '../decryptSecretKey'
import getHKDFKeysFromPassword from '../getHKDFKeysFromPassword'
import secretKeyToMnemonic from '../secretKeyToMnemonic'

import AEAD from '../types/AEAD'

/**
 * Convenience function for retrieving a mnemonic from a user's password and
 * `AEAD`. Simply derives the encryption key from the password, and uses that
 * to decrypt the encrypted secret key, then derives the mnemonic from the key.
 */
export default async function regenerateMnemonic(
  aead: AEAD,
  password: string,
  salt: string
): Promise<ReadonlyArray<string>> {
  const { encryptionKey } = await getHKDFKeysFromPassword(password, salt)
  const decryptedSecretKey = await decryptSecretKey(encryptionKey, aead)
  return secretKeyToMnemonic(decryptedSecretKey)
}
