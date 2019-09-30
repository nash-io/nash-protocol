import { Asset, Market, AEAD } from '../types'

/**
 * The configuration parameters used to initialize the Nash Protocol.
 *
 * Used to generate a `Config`.
 */
export default interface InitParams {
  /**
   * The secret key needed to decrypt the AEAD. If operating on the AEAD
   * returned by the CAS after authenticating, this should be the encryption
   * key derived from the user's password.
   *
   * Refer to the documentation for `getHKDFKeysFromPassword.md`.
   */
  encryptionKey: Buffer
  /**
   * A user's AEAD. When initializing, this is received from the CAS after
   * authenticating.
   *
   * Refer to the documentation for the `AEAD` interface.
   */
  aead: AEAD
  /**
   * A record of wallet types to chain index.
   *
   * For more information, refer to the [BIP-44 spec](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#index).
   */
  walletIndices: { readonly [key: string]: number }
  /**
   * A record of asset names to asset parameters.
   *
   * For more information, refer to the `Asset` interface.
   */
  assetData?: { readonly [key: string]: Asset }
  /**
   * A record of market names to market parameters.
   *
   * For more information, refer to the `Market` interface.
   */
  marketData?: { readonly [key: string]: Market }
  /**
   * The blockchain network to use.
   */
  net?: 'MainNet' | 'TestNet' | 'LocalNet'
}
