/*
  Custom d.ts for node-forge

  1. @types/node-forge has some missing types
  2. We are cherry-picking imports for a reduced bundle size, and some types
     don't map 100%
 */

type Byte = string
type Bytes = string
type Hex = string

declare module 'node-forge/lib/pki' {
  import { PublicKey, PrivateKey } from 'node-forge/lib/rsa'

  type PEM = string

  function privateKeyToPem(privateKey: PrivateKey, maxline?: number): PEM
  function publicKeyToPem(publicKey: PublicKey, maxline?: number): PEM
}

declare module 'node-forge/lib/rsa' {
  import { MessageDigest } from 'node-forge/lib/sha256'

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

  type EncryptionScheme =
    | 'RSAES-PKCS1-V1_5'
    | 'RSA-OAEP'
    | 'RAW'
    | 'NONE'
    | null
  type SignatureScheme = 'RSASSA-PKCS1-V1_5' | object | 'NONE' | null

  interface PublicKey {
    n: BigInteger
    e: BigInteger
    encrypt(data: Bytes, scheme?: EncryptionScheme, schemeOptions?: any): Bytes
    verify(digest: Bytes, signature: Bytes, scheme?: SignatureScheme): boolean
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
    decrypt(data: Bytes, scheme?: EncryptionScheme, schemeOptions?: any): string
    sign(md: MessageDigest, scheme?: SignatureScheme): Bytes
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

declare module 'node-forge/lib/sha256' {
  import { ByteStringBuffer } from 'node-forge/lib/util'

  type Encoding = 'raw' | 'utf8'

  interface MessageDigest {
    update(msg: string, encoding?: Encoding): MessageDigest
    digest(): ByteStringBuffer
  }

  function create(): MessageDigest
}

declare module 'node-forge/lib/util' {
  class ByteStringBuffer {
    constructor(
      bytes?: Bytes | ArrayBuffer | ArrayBufferView | ByteStringBuffer
    )
    data: string
    read: number
    length(): number
    isEmpty(): boolean
    putByte(byte: Byte): ByteStringBuffer
    fillWithByte(byte: Byte, n: number): ByteStringBuffer
    putBytes(bytes: Bytes): ByteStringBuffer
    putString(str: string): ByteStringBuffer
    putInt16(int: number): ByteStringBuffer
    putInt24(int: number): ByteStringBuffer
    putInt32(int: number): ByteStringBuffer
    putInt16Le(int: number): ByteStringBuffer
    putInt24Le(int: number): ByteStringBuffer
    putInt32Le(int: number): ByteStringBuffer
    putInt(int: number, numOfBits: number): ByteStringBuffer
    putSignedInt(int: number, numOfBits: number): ByteStringBuffer
    putBuffer(buffer: ByteStringBuffer): ByteStringBuffer
    getByte(): number
    getInt16(): number
    getInt24(): number
    getInt32(): number
    getInt16Le(): number
    getInt24Le(): number
    getInt32Le(): number
    getInt(numOfBits: number): number
    getSignedInt(numOfBits: number): number
    getBytes(count?: number): Bytes
    bytes(count?: number): Bytes
    at(index: number): Byte
    setAt(index: number, byte: number): ByteStringBuffer
    last(): Byte
    copy(): ByteStringBuffer
    compact(): ByteStringBuffer
    clear(): ByteStringBuffer
    truncate(): ByteStringBuffer
    toHex(): Hex
    toString(): string
  }
}
