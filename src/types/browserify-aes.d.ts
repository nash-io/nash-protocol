// Adapted from @types/node
declare module 'browserify-aes' {
  type Utf8AsciiBinaryEncoding = 'utf8' | 'ascii' | 'binary'
  type HexBase64BinaryEncoding = 'binary' | 'base64' | 'hex'
  type CipherCCMTypes = 'aes-128-ccm' | 'aes-192-ccm' | 'aes-256-ccm'
  type CipherGCMTypes = 'aes-128-gcm' | 'aes-192-gcm' | 'aes-256-gcm'

  interface Cipher extends NodeJS.ReadWriteStream {
    update(data: string | Buffer | NodeJS.TypedArray | DataView): Buffer
    update(data: string, input_encoding: Utf8AsciiBinaryEncoding): Buffer
    update(
      data: Buffer | NodeJS.TypedArray | DataView,
      output_encoding: HexBase64BinaryEncoding
    ): string
    update(
      data: Buffer | NodeJS.TypedArray | DataView,
      input_encoding: any,
      output_encoding: HexBase64BinaryEncoding
    ): string
    // second arg ignored
    update(
      data: string,
      input_encoding: Utf8AsciiBinaryEncoding,
      output_encoding: HexBase64BinaryEncoding
    ): string
    final(): Buffer
    final(output_encoding: string): string
    setAutoPadding(auto_padding?: boolean): this
    // getAuthTag(): Buffer;
    // setAAD(buffer: Buffer): this; // docs only say buffer
  }

  interface CipherCCM extends Cipher {
    setAAD(buffer: Buffer, options: { plaintextLength: number }): this
    getAuthTag(): Buffer
  }

  interface CipherGCM extends Cipher {
    setAAD(buffer: Buffer, options?: { plaintextLength: number }): this
    getAuthTag(): Buffer
  }

  interface Decipher extends NodeJS.ReadWriteStream {
    update(data: Buffer | NodeJS.TypedArray | DataView): Buffer
    update(data: string, input_encoding: HexBase64BinaryEncoding): Buffer
    update(
      data: Buffer | NodeJS.TypedArray | DataView,
      input_encoding: any,
      output_encoding: Utf8AsciiBinaryEncoding
    ): string
    // second arg is ignored
    update(
      data: string,
      input_encoding: HexBase64BinaryEncoding,
      output_encoding: Utf8AsciiBinaryEncoding
    ): string
    final(): Buffer
    final(output_encoding: string): string
    setAutoPadding(auto_padding?: boolean): this
    // setAuthTag(tag: Buffer | NodeJS.TypedArray | DataView): this;
    // setAAD(buffer: Buffer | NodeJS.TypedArray | DataView): this;
  }

  interface DecipherCCM extends Decipher {
    setAuthTag(buffer: Buffer | NodeJS.TypedArray | DataView): this
    setAAD(
      buffer: Buffer | NodeJS.TypedArray | DataView,
      options: { plaintextLength: number }
    ): this
  }
  interface DecipherGCM extends Decipher {
    setAuthTag(buffer: Buffer | NodeJS.TypedArray | DataView): this
    setAAD(
      buffer: Buffer | NodeJS.TypedArray | DataView,
      options?: { plaintextLength: number }
    ): this
  }

  interface CipherCCMOptions {
    [key: string]: any
    authTagLength: number
  }
  interface CipherGCMOptions {
    [key: string]: any
    authTagLength?: number
  }

  function createCipheriv(
    algorithm: CipherCCMTypes,
    key: string | Buffer | NodeJS.TypedArray | DataView,
    iv: string | Buffer | NodeJS.TypedArray | DataView,
    options: CipherCCMOptions
  ): CipherCCM
  function createCipheriv(
    algorithm: CipherGCMTypes,
    key: string | Buffer | NodeJS.TypedArray | DataView,
    iv: string | Buffer | NodeJS.TypedArray | DataView,
    options?: CipherGCMOptions
  ): CipherGCM
  // function createCipheriv(algorithm: string, key: string | Buffer | NodeJS.TypedArray | DataView, iv: string | Buffer | NodeJS.TypedArray | DataView, options?: stream.TransformOptions): Cipher;

  function createDecipheriv(
    algorithm: CipherCCMTypes,
    key: string | Buffer | NodeJS.TypedArray | DataView,
    iv: string | Buffer | NodeJS.TypedArray | DataView,
    options: CipherCCMOptions
  ): DecipherCCM
  function createDecipheriv(
    algorithm: CipherGCMTypes,
    key: string | Buffer | NodeJS.TypedArray | DataView,
    iv: string | Buffer | NodeJS.TypedArray | DataView,
    options?: CipherGCMOptions
  ): DecipherGCM
  // function createDecipheriv(algorithm: string, key: string | Buffer | NodeJS.TypedArray | DataView, iv: string | Buffer | NodeJS.TypedArray | DataView, options?: stream.TransformOptions): Decipher;
}
