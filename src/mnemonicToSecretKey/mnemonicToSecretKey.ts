import { mnemonicToEntropy } from 'bip39'

import bufferize from '../bufferize'

/**
 * Converts a BIP-39 mnemonic to its secret key representation.
 *
 * See `secretKeyToMnemonic.ts`.
 */
export default function mnemonicToSecretKey(mnemonic: ReadonlyArray<string>): Buffer {
  return bufferize(mnemonicToEntropy(mnemonic.join(' ')))
}
