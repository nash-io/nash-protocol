import { PayloadAndKind } from '../payload'
import { Config, BlockchainSignature, ChainNoncePair } from '../types'
import * as Bitcoin from 'bitcoinjs-lib'
import { ellipticContext } from '../utils/blockchain'

export function signBTCMessage(privateKey: string, data: string): BlockchainSignature {
  // the message prefix is hex version of "\x18Bitcoin Signed Message:\n"
  const prefix = '18426974636f696e205369676e6564204d6573736167653a0a'

  const dataLength = encodeVariableInteger(data.length)
  const payload = prefix + dataLength + Buffer.from(data).toString('hex')

  const btcHash = Bitcoin.crypto.hash256(Buffer.from(payload, 'hex'))

  return signBTC(privateKey, btcHash, true)
}

// Sign Arbitrary BTC message

// Signing for BTC
// 1. Compute a HASH160 of data.
// 2. Sign that hash with the private key.
export function signBTCBlockchainData(privateKey: string, data: string): BlockchainSignature {
  const hash = Bitcoin.crypto.hash160(Buffer.from(data))

  return signBTC(privateKey, hash)
}

export function signBTC(privateKey: string, data: Buffer, toBase64: boolean = false): BlockchainSignature {
  const kp = ellipticContext.keyFromPrivate(privateKey)

  const sig = kp.sign(data)
  let v = sig.recoveryParam === 0 ? '00' : '01'
  const r = sig.r.toString('hex', 64)
  const s = sig.s.toString('hex', 64)
  let signature: string = `${r}${s}${v}`

  if (toBase64) {
    v = sig.recoveryParam === 0 ? '1f' : '20'
    const vrs = `${v}${r}${s}`
    signature = Buffer.from(vrs, 'hex').toString('base64')
  }

  return {
    blockchain: 'BTC',
    signature
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

  throw new Error(`Could not encode data size of ${length}`)
}
