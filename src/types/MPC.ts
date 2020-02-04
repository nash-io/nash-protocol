export interface ComputePresigParams {
  apiKey: string
  messageHash: string
}

export interface FillRPoolParams {
  fillPoolUrl: string
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

export interface CreateApiKeyResult {
  publicKey: string
  apiKey: string
}
