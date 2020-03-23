import { PayloadAndKind } from '../payload'
import { ellipticContext } from '../utils/blockchain'
import { computePresig } from '../mpc/computePresig'
import { Config, Blockchain, BIP44, APIKey, PresignConfig, ChainNoncePair } from '../types'

export function signBTC(privateKey: string, message: string): BlockchainSignature {
  const data = Buffer.from(message, 'hex')
  const kp = ellipticContext.keyFromPrivate(privateKey)

<<<<<<< HEAD
  const sig = kp.sign(data, { canonical: true, pers: null })
=======
  const sig = kp.sign(data)
>>>>>>> Add functionality for prepare movement/sign tx digests
  const v = sig.recoveryParam === 0 ? '00' : '01'
  const r = sig.r.toString('hex', 64)
  const s = sig.s.toString('hex', 64)
  const signature: string = `${r}${s}${v}`

  return {
    blockchain: 'BTC',
    signature: signature.toLowerCase()
  }
}

export async function preSignBTC(
  apiKey: APIKey,
  config: PresignConfig,
  data: string,
  toBase64: boolean = false
): Promise<BlockchainSignature> {
  const btcChildKey = apiKey.child_keys[BIP44.BTC]
  const { r, presig } = await computePresig({
    apiKey: {
      client_secret_share: btcChildKey.client_secret_share,
      paillier_pk: apiKey.paillier_pk,
      public_key: btcChildKey.public_key,
      server_secret_share_encrypted: btcChildKey.server_secret_share_encrypted
    },
    blockchain: Blockchain.BTC,
    fillPoolFn: config.fillPoolFn,
    messageHash: data
  })
  if (toBase64) {
    return {
      blockchain: 'BTC',
      r: Buffer.from(r, 'hex').toString('base64'),
      signature: Buffer.from(presig, 'hex').toString('base64')
    }
  }
  return {
    blockchain: 'BTC',
    r,
    signature: presig
  }
}

export function buildBTCOrderSignatureData(
  config: Config,
  payloadAndKind: PayloadAndKind,
  chainNoncePair: ChainNoncePair
): string {
  console.info('Build BTC Order Signature Data:', config, payloadAndKind, chainNoncePair)
  return ''
}

export function buildBTCMovementSignatureData(config: Config, payloadAndKind: PayloadAndKind): string {
  console.info('build btc movement data: ', config, payloadAndKind)
  return ''
}

export function encodeVariableInteger(length: number): string {
  let total: Buffer

  if (length < 0xfd) {
    return length.toString(16).padStart(2, '0')
  } else if (length < 0xffff) {
    total = Buffer.alloc(2)
    total.writeUInt16LE(length, 0)
    return `fd${total.toString('hex')}`
  } else if (length < 0xffffffff) {
    total = Buffer.alloc(4)
    total.writeUInt32LE(length, 0)
    return `fe${total.toString('hex')}`
  }
  throw new Error('Invalid length ' + length)
}
