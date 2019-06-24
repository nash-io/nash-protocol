import Neon from '@cityofzion/neon-js'

// Retrieves the NEO script hash from the given Config object.
export default function getNEOScriptHash(address: string): string {
  return Neon.create.account(address).scriptHash
}
