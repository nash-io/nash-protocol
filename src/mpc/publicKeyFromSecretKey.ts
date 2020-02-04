import { MPCWalletModulePromise } from './wasmModule'
import { PublicKeyFromSecretKeyParams } from '../types/MPC'

export async function publicKeyFromSecretKey({ secret }: PublicKeyFromSecretKeyParams): Promise<string> {
  const MPCwallet = await MPCWalletModulePromise
  const [publicKeyFromSecretKeySuccess, publicKeyResult] = JSON.parse(MPCwallet.publickey_from_secretkey(secret)) as [
    boolean,
    string
  ]
  if (publicKeyFromSecretKeySuccess === false) {
    throw new Error('Error deriving public key from secret key.')
  }
  return publicKeyResult
}
