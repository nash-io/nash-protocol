declare module 'keccak' {
  interface KeccakHasher {
    digest(): Buffer
    update(message: string | Buffer, enc?: string): KeccakHasher

    _resetState(): void
    _clone(): KeccakHasher
  }

  type KeccakTypes =
    | 'keccak224'
    | 'keccak256'
    | 'keccak384'
    | 'keccak512'
    | 'sha3-224'
    | 'sha3-256'
    | 'sha3-384'
    | 'sha3-512'
    | 'shake128'
    | 'shake256'

  const keccak: (type: KeccakTypes) => KeccakHasher

  export default keccak
}
