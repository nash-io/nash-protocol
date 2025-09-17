
let usingWasm = false

export function getUsingWasm(): boolean {
  return usingWasm
}

export function forceWasm(): void {
  usingWasm = true
}
