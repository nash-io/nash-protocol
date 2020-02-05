export interface ComputePresigParams {
  apiKey: SignKey
  fillPoolUrl: string
  messageHash: string
}

export interface FillRPoolParams {
  fillPoolUrl: string
}

export interface SignKey {
  client_secret_share: string
  paillier_pk: {
    n: string
  }
  server_secret_share_encrypted: string
}

export interface PublicKeyFromSecretKeyParams {
  secret: string
}

export interface CreateApiKeyParams {
  secret: string
  generateProofUrl: string
  fillPoolUrl: string
}

export interface Presignature {
  presig: string
  r: string
}

export enum BIP44 {
  BTC = "m/44'/0'/0'/0/0",
  ETH = "m/44'/60'/0'/0/0",
  NEO = "m/44'/888'/0'/0/0",
  GQLAUTH = "m/1337'/888'/0'/0/0"
}

export interface ChildKey {
  client_secret_share: string
  server_secret_share_encrypted: string
}
export interface APIKey {
  paillier_pk: {
    n: string
  }
  child_keys: Record<BIP44, ChildKey>
}
