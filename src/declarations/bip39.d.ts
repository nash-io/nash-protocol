declare module 'bip39' {
  export function entropyToMnemonic(entropy: Buffer): string
  export function mnemonicToSeed(mnemonic: string, password?: string): Buffer
}
