import randomBytes from '../randomBytes'

// We need 128 bits for 12 words: (128 + (128 / 32)) / 11 = 12
// 128 / 8 = 16 bytes
const SECRET_KEY_SIZE_BYTES = 16

/**
 * Generates a secret key of Nash's desired length from a random entropy.
 *
 * This secret key is ultimately the foundation of a user's wallets, so should
 * be treated with extreme care.
 */
export default function getSecretKey(): Buffer {
  return randomBytes(SECRET_KEY_SIZE_BYTES)
}
