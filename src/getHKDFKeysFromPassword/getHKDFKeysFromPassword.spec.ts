import getHKDFKeysFromPassword from './getHKDFKeysFromPassword'

import stringify from '../stringify'

const password = 'hunter2'
const salt = '123'

test('generates two keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)
  const expectation = {
    authKey: 'd20102886717a39dbc49aeb65b98bacb741e25d578a475f532bbf8162f4739e0',
    encryptionKey:
      '6a6c9090c37dbbe9d3c47bd190a9ef919be7733d0186db1bb00a5298c6d4fe4e'
  }

  expect(stringify(output.authKey)).toBe(expectation.authKey)
  expect(stringify(output.encryptionKey)).toBe(expectation.encryptionKey)
})

test('generates symmetrical keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)

  expect(output.authKey.length).toBe(output.encryptionKey.length)
})
