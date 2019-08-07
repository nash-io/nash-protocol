import { validateMnemonic as validate } from 'bip39'

export default function validateMnemonic(mnemonic: ReadonlyArray<string>): boolean {
  return validate(mnemonic.join(' '))
}
