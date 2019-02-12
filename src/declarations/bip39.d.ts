declare module 'bip39' {
  export function entropyToMnemonic(entropy: Buffer): string
  export function mnemonicToEntropy(mnemonic: string): string
  export function mnemonicToSeed(mnemonic: string, password?: string): Buffer
}
