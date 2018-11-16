import randomBytes from 'randombytes'

interface EntropyKeys {
  readonly publicKey: Buffer
  readonly secretKey: Buffer
}

// We need 128 bits for 12 words: (128 + (128 / 32)) / 11 = 12
// 128 / 8 = 16 bytes
const NUM_BYTES = 16

export default function getEntropy(): EntropyKeys {
  return {
    publicKey: randomBytes(NUM_BYTES),
    secretKey: randomBytes(NUM_BYTES)
  }
}
