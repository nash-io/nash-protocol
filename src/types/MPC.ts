import { EllipticCurvePoint } from './EllipticCurvePoint'

/**
 * Secp256k1 for BTC, ETH
 * Secp256r1 for NEO
 */
export type Curve = 'Secp256k1' | 'Secp256r1'

export interface PallierPK {
  n: string
}

export interface Proof {
  correct_key_proof: {
    sigma_vec: string[]
  }
  paillier_pk: PallierPK
}

export type FillPoolFn = (
  arg: { curve: Curve; client_dh_publics: EllipticCurvePoint[] }
) => Promise<EllipticCurvePoint[]>
export type GenerateProofFn = (arg: {}) => Promise<Proof>
export interface ComputePresigParams {
  apiKey: SignKey
  curve: Curve
  fillPoolFn: FillPoolFn
  messageHash: string
}

export interface FillRPoolParams {
  fillPoolFn: FillPoolFn
  curve: Curve
}

export interface CreatePallierPKParams {
  generateProofFn: GenerateProofFn
}

export interface SignKey {
  client_secret_share: string
  paillier_pk: PallierPK
  server_secret_share_encrypted: string
}

export interface PublicKeyFromSecretKeyParams {
  secret: string
  curve: Curve
}

export interface CreateApiKeyParams {
  secret: string
  curve: Curve
  generateProofFn: GenerateProofFn
  fillPoolFn: FillPoolFn
}

export interface GenerateApiKeysParams {
  walletIndices: { readonly [key: string]: number }
  secret: string
  net: string
  generateProofFn: GenerateProofFn
  fillPoolFn: FillPoolFn
}

export interface Presignature {
  presig: string
  r: string
}

export enum BIP44 {
  BTC = "m/44'/0'/0'/0/0",
  ETH = "m/44'/60'/0'/0/0",
  NEO = "m/44'/888'/0'/0/0"
}

export interface ChildKey {
  client_secret_share: string
  address: string
  public_key: string
  server_secret_share_encrypted: string
}
export interface APIKey {
  version: number
  paillier_pk: PallierPK
  child_keys: Record<BIP44, ChildKey>
  payload_signing_key: string
  payload_public_key: string
}
