import { entropyToMnemonic } from 'bip39'

export default function secretKeyToMnemonic(secretKey: Buffer): ReadonlyArray<string> {
  // library returns wordlist as space-delimited string. Arrays should be easier to handle.
  return entropyToMnemonic(secretKey).split(' ')
}
