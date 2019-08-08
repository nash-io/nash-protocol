export interface BlockchainSignature {
  readonly blockchain: string
  readonly signature: string
}

export interface PayloadSignature {
  // This is the payoad being signed with optional embedded blockchain signatures.
  readonly payload: Record<string, any>
  readonly signature: string
  readonly blockchainMovement?: BlockchainMovement
  readonly canonicalString?: string
}

export interface BlockchainMovement {
  prefix: string
  address: string
  asset: string
  amount: string
  nonce: string
  userPubKey: string
  userSig?: string
}
