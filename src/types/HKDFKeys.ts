/**
 * The stretched keys derived from a master password via HKDF. Created via
 * `getHKDFKeysFromPassword`.
 */
export default interface HKDFKeys {
  /**
   * The derived key used for authentication with Nash's Central Accounts System.
   *
   * This is sent to Nash servers whenever signing in. This should never be
   * exposed elsewhere, but even if it is, an attacker will have limited
   * capability if the encryption key is not exposed.
   */
  readonly authKey: Buffer
  /**
   * The derived key used for encrypting the user's secret key.
   *
   * This is _NEVER_ sent to the Nash servers, and should _NEVER_ be exposed.
   * If made available with the user's encrypted secret key, all of the user's
   * funds are freely accessible.
   */
  readonly encryptionKey: Buffer
}
