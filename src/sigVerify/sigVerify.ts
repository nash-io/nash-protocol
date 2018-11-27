import { PublicKey } from 'node-forge/lib/rsa'
import sha256 from 'node-forge/lib/sha256'

export default function sigVerify(
  publicKey: PublicKey,
  payload: string,
  signature: string
): boolean {
  const md = sha256.create().update(payload, 'utf8')

  return publicKey.verify(md.digest().bytes(), signature)
}
