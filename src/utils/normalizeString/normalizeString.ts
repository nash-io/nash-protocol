/*
  NFKC normalization treats certain "composed" characters as identical.
  For example, some systems represent ü as ¨ + u while others treat ü as its
  own code point. It is recommended to treat them as the same so input format
  doesn't cause a password containing certain characters to magically fail.
 */
export default function normalizeString(str: string): Buffer {
  return Buffer.from(str.normalize('NFKC'))
}
