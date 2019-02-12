import { mnemonicToEntropy } from 'bip39'

import bufferize from '../bufferize'

export default function mnemonicToSecretKey(
  mnemonic: ReadonlyArray<string>
): Buffer {
  return bufferize(mnemonicToEntropy(mnemonic.join(' ')))
}
