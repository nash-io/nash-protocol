import { SigningPayloadID } from './signingPayloadID'

export interface PayloadAndKind {
  readonly payload: Record<string, any>
  readonly kind: SigningPayloadID
}
