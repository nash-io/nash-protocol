import { recoverWallet } from './recoverWallet'

test('recover account', async () => {
  try {
    const wallet = await recoverWallet('password', 'encryptedSecretKey', 'encryptedSecretNonce', 'encryptedSecretTag')
    console.log('Wallet: ', wallet)
  } catch (e) {
    console.log('Could not recover account: ', e)
  }
})
