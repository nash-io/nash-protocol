import { entropyToMnemonic } from 'bip39'

/**
 * Converts a given secret key to its BIP-39 mnemonic representation.
 *
 * Returns the mnemonic as an array of words.
 *
 * See `mnemonicToSecretKey.ts`.
 */
export default function secretKeyToMnemonic(secretKey: Buffer): ReadonlyArray<string> {
  // library returns wordlist as space-delimited string. Arrays should be easier to handle.
  return entropyToMnemonic(secretKey).split(' ')
}
