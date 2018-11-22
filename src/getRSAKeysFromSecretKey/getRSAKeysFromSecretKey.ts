// tslint:disable:no-object-mutation
// tslint:disable:no-expression-statement
import hkdf from 'futoin-hkdf'
import random from 'node-forge/lib/random'
import rsa, { KeyPair } from 'node-forge/lib/rsa'

const RSA_SIZE_BITS = 2048
const RSA_SIZE_BYTES = RSA_SIZE_BITS / 8

/*
  Technically takes any buffer as input, but is meant to be used to
  deterministically generate an RSA key pair from a user's skey.

  Returns keys in Forge's internal buffer format. We have to serialize
  with seralizeRSAKeys() to send to server.

  Warning: This may be a bottleneck, as speed is dependent on webworker
  support. So performance on old mobile browsers etc. may be very bad.
 */
export default function getRSAKeysFromSecretKey(
  secretKey: Buffer
): Promise<KeyPair> {
  /*
    With each call, we create a new PRNG engine seeded with our secret key.
    Secret key is 16 bytes, we want our PRNG seed to match the RSA size.
   */
  const prng = random.createInstance()
  const stretchedSecretKey = hkdf(secretKey, RSA_SIZE_BYTES, {
    hash: 'SHA-256',
    info: 'RSA'
  })
  prng.seedFileSync = (_: number) => stretchedSecretKey.toString('hex')

  return new Promise((resolve, reject) =>
    rsa.generateKeyPair(
      {
        bits: RSA_SIZE_BITS,
        prng,
        workers: 2
      },
      (err: Error, keypair: KeyPair) => (err ? reject(err) : resolve(keypair))
    )
  )
}
