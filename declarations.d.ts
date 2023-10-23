declare module '*.wasm' {
  const value: any
  export default value
}

declare module 'scrypt-async' {
  interface CallbackFunc {
    (key: string): any
    (key: number[]): any
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
