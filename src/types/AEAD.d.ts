export default interface AEAD {
  readonly encryptedSecretKey: Buffer
  readonly nonce: Buffer
  readonly tag: Buffer
}
