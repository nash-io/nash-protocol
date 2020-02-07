import { PublicKeyFromSecretKeyParams } from '../types/MPC'

export async function publicKeyFromSecretKey({ secret }: PublicKeyFromSecretKeyParams): Promise<string> {
  const MPCWallet = await import('../wasm')
  const [publicKeyFromSecretKeySuccess, publicKeyResult] = JSON.parse(MPCWallet.publickey_from_secretkey(secret)) as [
    boolean,
    string
  ]
  if (publicKeyFromSecretKeySuccess === false) {
    throw new Error('Error deriving public key from secret key.')
  }
  return publicKeyResult
}
