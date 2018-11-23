import decryptSecretKey from '../decryptSecretKey'
import getHKDFKeysFromPassword from '../getHKDFKeysFromPassword'
import secretKeyToMnemonic from '../secretKeyToMnemonic'

import AEAD from '../types/AEAD'

export default async function regenerateMnemonic(
  aead: AEAD,
  password: string,
  salt: string
): Promise<ReadonlyArray<string>> {
  const { encryptionKey } = await getHKDFKeysFromPassword(password, salt)
  const decryptedSecretKey = await decryptSecretKey(encryptionKey, aead)
  return secretKeyToMnemonic(decryptedSecretKey)
}
