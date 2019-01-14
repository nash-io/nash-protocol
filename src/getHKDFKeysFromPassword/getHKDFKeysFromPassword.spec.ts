import getHKDFKeysFromPassword from './getHKDFKeysFromPassword'

import stringify from '../stringify'

const password = 'hunter2'
const salt = 'b0cd9948365b'

test('generates two keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)
  const expectation = {
    authKey: 'af0782580bb2ec65b72cb184cf729dd16dfd5669ae247c64aa8d6d01b6ed8a34',
    encryptionKey:
      'f0dfbf6f8d2229bbed18778a44832a93364fb133e01057e673d11327528042ed'
  }

  expect(stringify(output.authKey)).toBe(expectation.authKey)
  expect(stringify(output.encryptionKey)).toBe(expectation.encryptionKey)
})

test('generates symmetrical keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)

  expect(output.authKey.length).toBe(output.encryptionKey.length)
})
