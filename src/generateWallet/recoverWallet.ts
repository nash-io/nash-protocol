import getHKDFKeysFromPassword from '../getHKDFKeysFromPassword'
import initialize from '../initialize'
import bufferize from '../bufferize'
import Config from '../__tests__/config.json'

export const recoverWallet = async (password, encryptedSecretKey, encryptedNonce, encryptedTag) => {
  const result = await getHKDFKeysFromPassword(password, '')
  const wallet = await initialize({
    aead: {
      encryptedSecretKey: bufferize(encryptedSecretKey),
      nonce: bufferize(encryptedNonce),
      tag: bufferize(encryptedTag)
    },
    assetData: Config.assetData,
    encryptionKey: result.encryptionKey,
    marketData: Config.marketData,
    walletIndices: { neo: 1, eth: 1, btc: 1, neo3: 1, avaxc: 1, polygon: 1 }
  })
  return wallet.wallets
}
