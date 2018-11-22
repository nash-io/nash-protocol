type Bytes = string

declare module 'node-forge/lib/pki' {
  import { PublicKey, PrivateKey } from 'node-forge/lib/rsa'

  function privateKeyToPem(privateKey: PrivateKey): string
  function publicKeyToPem(publicKey: PublicKey): string
}

declare module 'node-forge/lib/rsa' {
  interface KeyPair {
    publicKey: PublicKey
    privateKey: PrivateKey
  }

  interface BigInteger {
    data: number[]
    t: number
    s: number
    toString(): string
  }

  interface PublicKey {
    n: BigInteger
    e: BigInteger
    encrypt(data: string, scheme?: string, schemeOptions?: number): Bytes
    verify(digest: string, signature: string, scheme?: string): boolean
  }

  interface PrivateKey {
    n: BigInteger
    e: BigInteger
    d: BigInteger
    p: BigInteger
    q: BigInteger
    dP: BigInteger
    dQ: BigInteger
    qInv: BigInteger
    decrypt(data: string, scheme?: string, schemeOptions?: number): string
    sign(md: string, scheme?: string): Bytes
  }

  interface GenerateKeyPairOptions {
    bits?: number
    e?: number
    workerScript?: string
    workers?: number
    workLoad?: number
    prng?: any
    algorithm?: string
  }

  function setPublicKey(n: any, e: any): any

  function generateKeyPair(
    bits?: number,
    e?: number,
    callback?: (err: Error, keypair: KeyPair) => void
  ): KeyPair
  function generateKeyPair(
    options?: GenerateKeyPairOptions,
    callback?: (err: Error, keypair: KeyPair) => void
  ): KeyPair
}

declare module 'node-forge/lib/random' {
  function getBytes(count: number, callback?: (bytes: Bytes) => any): Bytes
  function getBytesSync(count: number): Bytes
  type CB = (_: any, seed: string) => void
  interface Random {
    seedFileSync: (needed: number) => string
    seedFile: (needed: number, cb: CB) => void
  }
  function createInstance(): Random
}
