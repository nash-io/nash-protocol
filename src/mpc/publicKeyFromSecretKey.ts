import { PublicKeyFromSecretKeyParams } from '../types/MPC'

export async function publicKeyFromSecretKey({ secret, curve }: PublicKeyFromSecretKeyParams): Promise<string> {
  const MPCWallet = await import('../mpc-lib')
  const [publicKeyFromSecretKeySuccess, publicKeyResult] = JSON.parse(
    MPCWallet.publickey_from_secretkey(secret, JSON.stringify(curve))
  ) as [boolean, string]
  if (publicKeyFromSecretKeySuccess === false) {
    throw new Error('Error deriving public key from secret key.')
  }
  return publicKeyResult
}
