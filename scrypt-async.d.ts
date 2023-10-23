declare module 'scrypt-async' {
  interface CallbackFunc {
    (key: string): any
  }
  interface Options {
    N?: number | undefined
    logN?: number | undefined
    r: number
    p: number
    dkLen: number
    encoding?: string | undefined
    interruptStep?: number | undefined
  }
  export default function scrypt(
    password: Buffer | string,
    salt: Buffer | string,
    options: Options,
    callback: CallbackFunc
  ): void
}
