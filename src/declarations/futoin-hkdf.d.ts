declare module 'futoin-hkdf' {
  interface Options {
    hash: 'SHA-256'
    info: string
    salt?: string
  }
  function hkdf(hashed: Buffer, length: number, options: Options): Buffer

  export = hkdf
}
