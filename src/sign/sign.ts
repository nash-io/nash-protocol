import BN from 'bn.js'
import { utils } from 'elliptic'
/** We can use this signing function instead of the one from elliptic. It is about 3/4 times faster in node environments */
export async function sign(sk: string, msg: string): Promise<{ r: string; s: string }> {
  const MPCWallet = await import('../mpc-lib')
  const [ok, r, s] = JSON.parse(MPCWallet.sign(sk, msg))
  if (!ok) {
    throw new Error('Failed to compute signature')
  }
  return { r, s }
}

/// Implementation below comes directly from elliptic
function rmPadding(buf: number[]): number[] {
  let i = 0
  const len = buf.length - 1
  while (!buf[i] && !(buf[i + 1] & 0x80) && i < len) {
    i++
  }
  if (i === 0) {
    return buf
  }
  return buf.slice(i)
}

function constructLength(arr: number[], len: number): void {
  if (len < 0x80) {
    arr.push(len)
    return
  }
  let octets = 1 + ((Math.log(len) / Math.LN2) >>> 3)
  arr.push(octets | 0x80)
  while (--octets) {
    arr.push((len >>> (octets << 3)) & 0xff)
  }
  arr.push(len)
}

export function toDER(sig: { r: string; s: string }, enc: string): number[] {
  let r = new BN(sig.r, 16).toArray()
  let s = new BN(sig.s, 16).toArray()
  // Pad values
  if (r[0] & 0x80) {
    r = [0].concat(r)
  }
  // Pad values
  if (s[0] & 0x80) {
    s = [0].concat(s)
  }

  r = rmPadding(r)
  s = rmPadding(s)

  while (!s[0] && !(s[1] & 0x80)) {
    s = s.slice(1)
  }
  let arr = [0x02]
  constructLength(arr, r.length)
  arr = arr.concat(r)
  arr.push(0x02)
  constructLength(arr, s.length)
  const backHalf = arr.concat(s)
  let res = [0x30]
  constructLength(res, backHalf.length)
  res = res.concat(backHalf)
  return utils.encode(res, enc)
}
