import { mnemonicToSeed } from 'bip39'

// We might want to customize this down the line but this works out of the box for now.
export default function mnemonicToMasterSeed(mnemonic: ReadonlyArray<string>): Buffer {
  return mnemonicToSeed(mnemonic.join(' '))
}
