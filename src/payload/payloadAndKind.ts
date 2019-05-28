import { SigningPayloadID } from './signingPayloadID'

export interface PayloadAndKind {
  readonly payload: any
  readonly kind: SigningPayloadID
}
