import hexEncoding from 'crypto-js/enc-hex'
import SHA256 from 'crypto-js/sha256'
import { ec as EC } from 'elliptic'
import compose from 'lodash/fp/compose'
import mapKeys from 'lodash/fp/mapKeys'
import snakeCase from 'lodash/fp/snakeCase'
import toLower from 'lodash/fp/toLower'

import bufferize from '../bufferize'
import stringify from '../stringify'
import deep from '../utils/deep'
import { canSignKind, kindToName, SigningPayloadID } from './signingPayloadID'

const curve = new EC('secp256k1')

export const getRawPayload = compose(
  toLower,
  JSON.stringify,
  o =>
    Object.keys(o)
      .sort()
      .reduce((acc, el) => ({ ...acc, [el]: o[el] }), {}),
  deep(mapKeys(snakeCase))
)

export default function signPayload(
  privateKey: Buffer,
  kind: SigningPayloadID,
  payload: Record<string, any>
): string {
  if (!canSignKind(kind)) {
    throw new Error(
      `Cannot use nex-auth-protocol to signed payload with kind ${kind}`
    )
  }
  const payloadName = kindToName(kind)
  const message = `${payloadName},${getRawPayload(payload)}`
  const keypair = curve.keyFromPrivate(privateKey)

  const sig = keypair.sign(SHA256(message).toString(hexEncoding), {
    canonical: true,
    pers: null
  })

  return stringify(bufferize(sig.toDER()))
}
