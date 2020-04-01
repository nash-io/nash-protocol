import base58 from 'bs58'

const hexRegex = /^([0-9A-Fa-f]{2})*$/
/**
 * Checks if input is a hexstring. Empty string is considered a hexstring.
 */
export function isHex(str: string): boolean {
  try {
    return hexRegex.test(str)
  } catch (err) {
    return false
  }
}

/**
 * Throws an error if input is not hexstring.
 */
export function ensureHex(str: string): void {
  if (!isHex(str)) {
    throw new Error(`Expected a hexstring but got ${str}`)
  }
}

export function ab2hexstring(arr: ArrayBuffer | ArrayLike<number>): string {
  if (typeof arr !== 'object') {
    throw new Error(`ab2hexstring expects an array. Input was ${arr}`)
  }
  let result = ''
  const intArray = new Uint8Array(arr)
  for (const i of intArray) {
    let str = i.toString(16)
    str = str.length === 0 ? '00' : str.length === 1 ? '0' + str : str
    result += str
  }
  return result
}

/**
 * Reverses a HEX string, treating 2 chars as a byte.
 * @example
 * reverseHex('abcdef') = 'efcdab'
 */
export function reverseHex(hex: string): string {
  ensureHex(hex)
  let out = ''
  for (let i = hex.length - 2; i >= 0; i -= 2) {
    out += hex.substr(i, 2)
  }
  return out
}

/**
 * Converts an address to scripthash.
 */
export const getScriptHashFromAddress = (address: string): string => {
  const hash = ab2hexstring(base58.decode(address))
  return reverseHex(hash.substr(2, 40))
}

// Retrieves the NEO script hash from the given Config object.
export default function getNEOScriptHash(address: string): string {
  return getScriptHashFromAddress(address)
}
