// Types on DefinitelyTyped are wrong
declare module 'scrypt-js' {
  type Callback = (error: Error, progress: number, key: string) => any

  function scrypt(
    password: Buffer,
    salt: Buffer,
    N: number,
    r: number,
    p: number,
    dkLen: number,
    callback: Callback
  ): void

  export = scrypt
}
