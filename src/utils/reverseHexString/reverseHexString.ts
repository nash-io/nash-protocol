export default function reverseHexString(hex: string): string {
  const rev = hex.match(/[a-fA-F0-9]{2}/g)
  if (!rev) {
    throw new Error('invalid hex string given')
  }
  return rev.reverse().join('')
}
