import { validateMnemonic as validate } from 'bip39'

/**
 * Checks if an array of BIP39 words forms a valid BIP39 mnemonic. Note that
 * Nash uses 12-word mnemonics, but this function will return `true` for a spec
 * compliant mnemonic of any length.
 *
 * @param mnemonic An array of words to validate.
 */
export default function validateMnemonic(mnemonic: ReadonlyArray<string>): boolean {
  return validate(mnemonic.join(' '))
}
