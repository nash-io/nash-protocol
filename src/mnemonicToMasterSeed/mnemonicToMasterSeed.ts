import { mnemonicToSeed } from 'bip39'

/**
 * Converts a BIP-39 mnemonic to its master seed representation. This
 * representation is used to generate blockchain wallets.
 */
export default function mnemonicToMasterSeed(mnemonic: ReadonlyArray<string>): Buffer {
  return mnemonicToSeed(mnemonic.join(' '))
}
