import getHKDFKeysFromPassword from './getHKDFKeysFromPassword'

import stringify from '../stringify'

const password = 'hunter2'
const salt = 'b0cd9948365b'

test('generates two keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)
  const expectation = {
    authKey: '93250344b99a3ae0d61573bf453045ece6fb480d72932eefb888b6b712639ffb',
    encryptionKey:
      '9f4da51b3547a9720ed9570a2bbb2e5909ac076f02962a9a69e1850a2c9ba9c0'
  }

  expect(stringify(output.authKey)).toBe(expectation.authKey)
  expect(stringify(output.encryptionKey)).toBe(expectation.encryptionKey)
})

test('generates symmetrical keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)

  expect(output.authKey.length).toBe(output.encryptionKey.length)
})
