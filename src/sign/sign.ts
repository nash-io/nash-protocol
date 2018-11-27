import { PrivateKey } from 'node-forge/lib/rsa'
import sha256 from 'node-forge/lib/sha256'

// TODO: This uses PKCS#1 v1.5, it is recommended to switch to PSS
// We should get verification working on the elixir side with the simple
// case, and then upgrade
export default function sign(privateKey: PrivateKey, payload: string): string {
  const md = sha256.create().update(payload, 'utf8')

  return privateKey.sign(md)
}
