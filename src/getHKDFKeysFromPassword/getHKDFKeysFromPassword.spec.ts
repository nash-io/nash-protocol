import getHKDFKeysFromPassword from './getHKDFKeysFromPassword'

const password = 'hunter2'
const userID = '123'

test('generates two keys', async () => {
  const output = await getHKDFKeysFromPassword(password, userID)
  const expectation = {
    authKey: '56574ba7863f5c40eac760e27b6b568c99c4f188733ce41a299232a9853d7526',
    encryptionKey:
      'aeff532496334753cfbab828d84bf44f1720641772bd48424833dfd40e838c13'
  }

  expect(output.authKey.toString('hex')).toBe(expectation.authKey)
  expect(output.encryptionKey.toString('hex')).toBe(expectation.encryptionKey)
})

test('generates symmetrical keys', async () => {
  const output = await getHKDFKeysFromPassword(password, userID)

  expect(output.authKey.length).toBe(output.encryptionKey.length)
})
