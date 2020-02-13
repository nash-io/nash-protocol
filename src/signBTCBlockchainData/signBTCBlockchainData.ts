import { BlockchainSignature } from '../types'
import { ellipticContext } from '../utils/blockchain'

export function signBTC(privateKey: string, message: string): BlockchainSignature {
  const data = Buffer.from(message, 'hex')
  const kp = ellipticContext.keyFromPrivate(privateKey)

  const sig = kp.sign(data)
  const v = sig.recoveryParam === 0 ? '00' : '01'
  const r = sig.r.toString('hex', 64)
  const s = sig.s.toString('hex', 64)
  const signature: string = `${r}${s}${v}`

  return {
    blockchain: 'BTC',
    signature: signature.toLowerCase()
  }
}
