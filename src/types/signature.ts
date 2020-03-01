import { Presignature } from './MPC'
/**
 * The output from payload signing for blockchain operations.
 *
 * Refer to the documentation for `signPayload.ts`.
 */
export interface BlockchainSignature {
  readonly blockchain: string
  readonly signature: string
  readonly r?: string
  readonly publicKey?: string
  nonceTo?: number
  nonceFrom?: number
}

/**
 * The output from payload signing. Is used by the Nash Matching Engine to
 * validate the authenticity of requests.
 *
 * A `PayloadSignature` may optionally contain a blockchain movement, which is
 * needed for certain operations that interact with the blockchain, such as
 * order placement. For such requests, the `payload` should include appropriate
 * blockchain signatures.
 *
 * Refer to the documentation for `signPayload.ts`.
 */
export interface PayloadSignature {
  /**
   * The payload being signed with optional embedded blockchain signatures.
   *
   * At a bare minimum, a `timestamp` is required. For operations involving
   * blockchain, a `blockchain_signatures` array is also required.
   *
   * @TODO Better instructions needed for how to use blockchain signatures.
   *
   * @property `timestamp` Current timestamp in milliseconds.
   * @property `blockchain_signatures` An array of blockchain signatures.
   */
  readonly payload: Record<string, any>
  readonly signature: string
  readonly blockchainMovement?: BlockchainMovement
  readonly canonicalString?: string
  readonly blockchainRaw?: any
}

export interface PayloadPreSignature {
  /**
   * The payload being signed with optional embedded blockchain signatures.
   *
   * At a bare minimum, a `timestamp` is required. For operations involving
   * blockchain, a `blockchain_signatures` array is also required.
   *
   * @TODO Better instructions needed for how to use blockchain signatures.
   *
   * @property `timestamp` Current timestamp in milliseconds.
   * @property `blockchain_signatures` An array of blockchain signatures.
   */
  readonly payload: Record<string, any>
  readonly signature: Presignature
  readonly canonicalString?: string
  readonly blockchainRaw?: any
}

/**
 * @TODO add documentation.
 */
export interface BlockchainMovement {
  prefix: string
  address: string
  asset: string
  amount: string
  nonce: string
  userPubKey: string
  userSig?: string
  r?: string
}
