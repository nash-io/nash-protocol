# nash-protocol

Implementation of Nash cryptographic routines.

## [Documentation available here](https://nash-io.github.io/nash-protocol)


## Getting started

    yarn install
    yarn build
    yarn test

## Usage Summary

### Onboarding

The Nash Protocol contains functions necessary to create, setup, and authenticate into an account.

#### Account creation

This step registers a new user with Nash's Central Accounts System.

1. A user signs up for an account and provides a password.
2. `hashPassword()` should be called to hash the password, and `getHKDFKeysFromPassword()` should be called on the hashed password to get an **authentication key** and **encryption key**.
3. The **authentication key** is sent to Nash's Central Accounts System in lieu of the original password, and is what is used hereafter for authentication. The **encryption key** is never sent to Nash, and must be computed on the fly from the user's password by the client.

#### Account setup

This step creates blockchain wallets for a user.

1. `getEntropy()` is called to generate a **secret key**.
2. `secretKeyToMnemonic()` is called on the **secret key** to provide a user's **mnemonic**. The user should persist this and never share this value.
3. `mnemonicToMasterSeed()` is called on the **mnemonic** to create the **master seed**, which is the seed value for BIP-44 HD wallet generation.
4. `generateWallet` is called using the **master seed** for all supported coin types.
5. Wallet public keys are sent to Nash. Private keys are never sent to Nash, and should be computed on the fly by the client.
6. The **secret key** is encrypted with `encryptSecretKey()`, which produces an **encrypted secret key AEAD object**. This is sent to Nash.

### Authentication

1. User provides their password.
2. `getHKDFKeysFromPassword()` is used to get the **authentication key** and **encryption key**.
3. The **authentication key** is sent to Nash, which responds with the **encrypted secret key AEAD object** and some **wallet metadata** (public keys and chain heights).
4. The client calls `initialize()` with the **encrypted secret key AEAD object**, **encryption key**, **wallet metadata**, and some Nash Matching Engine market and asset data to receive a **config**.
5. This **config** contains all necessary values to interact with the Nash Matching Engine, including the ability to sign payloads needed for operations such as order placement, viewing private account information, asset transfers, and staking.

## Glossary

**Secret** values are never sent to Nash. Values that are **visible to Nash** are. A combination of secret values and values accessible by Nash are needed for all sensitive operations. Both types of values are sensitive and should be carefully guarded.

- Authentication key: Derived from password. Used to authentcate into Nash's systems. **Visible to Nash**.
- BIP-39: Protocol for generating master seed from private key.
- BIP-44: Protocol for generating wallet addresses from master seed.
- Chain: an ID for each blockchain we want to generate a private key for. Constant. Nash uses the [coin types](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#coin-type) as defined by BIP044.
- Encrypted secret key: The secret key encrypted via the encryption key via AEAD. Cannot be decrypted without the encryption key. **Visible to Nash.**
- Encryption key: Derived from password. Used to encrypt the private key for server side storage. **Secret.**
- Master seed: Value used to generate wallets. Derived from mnemonic. **Secret.**
- Mnemonic: A n-word phrase generated from the secret key using a wordlist. Can be used along with passphrase to (re)generate the master seed. **Secret.**
- Password: User's login credential. Used to generate encryption key and auth key via HKDF. **Secret.**
- Secret key: A random value. Abstracted into the **mnemonic** for better user experience. We use this as the "master key" -- the ultimate password from which everything is derived, that should be protected at all costs. **Secret.** (An encrypted version is visible to Nash.)

## Notes

### External wallet keys

We will NOT support the user supplying their own wallet keys. While users will control their own wallets, we will generate the wallets for them. This is partially because we want wallets to be deterministically derivable from the master seed.


## References

- [BIP-39 - master seed generation](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
  - [Detail: seed generation](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#from-mnemonic-to-seed)
  - [Implementation](https://github.com/bitcoinjs/bip39)
  - [Playground](https://iancoleman.io/bip39/)
- [BIP-44 - deterministic wallets](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
  - [Current address master list](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
- [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2)
  - [Implementation](https://github.com/crypto-browserify/pbkdf2)
