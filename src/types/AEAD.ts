/**
 * A record containing a user's encrypted secret key and associated data.
 * Requires a corresponding encryption key with which to decrypt the secret
 * key in order to function.
 *
 * This value is passed to the Nash Central Account System for new accounts.
 * The corresponding encryption key is never passed, and needs to be supplied
 * by the client.
 *
 * Two top-level functions deal with AEADs: `encryptSecretKey.ts` and
 * `decryptSecretKey.ts`.
 *
 * Additionally, initialization of the Nash Protocol for a user requires the
 * user's AEAD.
 *
 * Refer to [this manual](https://www.cryptosys.net/manapi/api_aeadalgorithms.html)
 * for more information on the nonce and tag.
 */
export default interface AEAD {
  /**
   * The encrypted version of a user's master key.
   */
  readonly encryptedSecretKey: Buffer
  /**
   * Associated AEAD data.
   */
  readonly nonce: Buffer
  /**
   * Associated AEAD data.
   */
  readonly tag: Buffer
}
