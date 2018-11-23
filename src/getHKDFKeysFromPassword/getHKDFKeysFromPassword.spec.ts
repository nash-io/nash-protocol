import getHKDFKeysFromPassword from './getHKDFKeysFromPassword'

import stringify from '../stringify'

const password = 'hunter2'
const salt = '123'

test('generates two keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)
  const expectation = {
    authKey: '56574ba7863f5c40eac760e27b6b568c99c4f188733ce41a299232a9853d7526',
    encryptionKey:
      'aeff532496334753cfbab828d84bf44f1720641772bd48424833dfd40e838c13'
  }

  expect(stringify(output.authKey)).toBe(expectation.authKey)
  expect(stringify(output.encryptionKey)).toBe(expectation.encryptionKey)
})

test('generates symmetrical keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)

  expect(output.authKey.length).toBe(output.encryptionKey.length)
})
