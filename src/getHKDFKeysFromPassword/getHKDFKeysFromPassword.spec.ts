import getHKDFKeysFromPassword from './getHKDFKeysFromPassword'

import stringify from '../stringify'

import testVectors from '../__tests__/testVectors.json'

const password = 'hunter2'
const salt = 'b0cd9948365b'

testVectors.forEach((vector, idx) =>
  test(`passes test vector ${idx + 1}`, async () => {
    const output = await getHKDFKeysFromPassword(vector.password, vector.salt)

    expect(stringify(output.authKey)).toBe(vector.authKey)
    expect(stringify(output.encryptionKey)).toBe(vector.encryptionKey)
  })
)

test('generates symmetrical keys', async () => {
  const output = await getHKDFKeysFromPassword(password, salt)

  expect(output.authKey.length).toBe(output.encryptionKey.length)
})
