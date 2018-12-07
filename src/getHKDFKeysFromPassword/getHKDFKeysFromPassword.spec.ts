import getHKDFKeysFromPassword from './getHKDFKeysFromPassword'

import stringify from '../stringify'

const password = 'hunter2'
const salt = '123'

test('generates two keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)
  const expectation = {
    authKey: '0gECiGcXo528Sa62W5i6y3QeJdV4pHX1Mrv4Fi9HOeA=',
    encryptionKey: 'amyQkMN9u+nTxHvRkKnvkZvncz0BhtsbsApSmMbU/k4='
  }

  expect(stringify(output.authKey)).toBe(expectation.authKey)
  expect(stringify(output.encryptionKey)).toBe(expectation.encryptionKey)
})

test('generates symmetrical keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)

  expect(output.authKey.length).toBe(output.encryptionKey.length)
})
