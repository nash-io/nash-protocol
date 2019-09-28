/**
 * Represents a standardized wallet interface agnostic of blockchain.
 */
export default interface Wallet {
  /**
   * A shortened form of the public key.
   */
  readonly address: string
  /**
   * Key granting ownership of wallet funds. Derived from the 12-word mnemonic.
   */
  readonly privateKey: string
  /**
   * Key used for receiving funds. Derived from private key.
   */
  readonly publicKey: string
  /**
   * Wallet index as defined by BIP-44 used for HD key derivation.
   *
   * For more information, refer to the [BIP-44 spec](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#index).
   */
  readonly index: number
}
