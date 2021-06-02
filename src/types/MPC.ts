export enum Blockchain {
  BTC = 'BTC',
  ETH = 'ETH',
  NEO = 'NEO'
}

/**
 * Secp256k1 for BTC, ETH
 * Secp256r1 for NEO
 */
export type Curve = 'Secp256k1' | 'Secp256r1'

export const BlockchainCurve: Record<Blockchain, Curve> = {
  [Blockchain.BTC]: 'Secp256k1',
  [Blockchain.ETH]: 'Secp256k1',
  [Blockchain.NEO]: 'Secp256r1'
}

export interface PallierPK {
  n: string
}

export interface Proof {
  correct_key_proof: {
    sigma_vec: string[]
  }
  paillier_pk: PallierPK
}

export type FillPoolFn = (arg: { blockchain: Blockchain; client_dh_publics: string[] }) => Promise<string[]>
export type GenerateProofFn = (arg: {}) => Promise<Proof>

export interface ComputePresigParams {
  apiKey: SignKey
  blockchain: Blockchain
  fillPoolFn: FillPoolFn
  messageHash: string
}

export interface FillRPoolParams {
  fillPoolFn: FillPoolFn
  blockchain: Blockchain
  paillierPkStr: string
}

export interface CreatePallierPKParams {
  generateProofFn: GenerateProofFn
}

export interface SignKey {
  client_secret_share: string
  paillier_pk: PallierPK
  public_key: string
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
}

export interface GenerateApiKeysParams {
  walletIndices: { readonly [key: string]: number }
  secret: string
  net: string
  generateProofFn: GenerateProofFn
}

export interface Presignature {
  presig: string
  r: string
}

export enum BIP44 {
  BTC = "m/44'/0'/0'/0/0",
  ETH = "m/44'/60'/0'/0/0",
  NEO = "m/44'/888'/0'/0/0",
  AVAXC = "m/44'/9000'/0'/0/0"
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
