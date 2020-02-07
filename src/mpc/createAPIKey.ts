import { fillRPoolIfNeeded } from './fillRPool'
import { CreateApiKeyParams, SignKey } from '../types/MPC'

// Do we need to cache this key?
const paillierPKs = new Map<string, Promise<string>>()

export async function createAPIKey({ secret, fillPoolFn, generateProofFn }: CreateApiKeyParams): Promise<SignKey> {
  await fillRPoolIfNeeded({ fillPoolFn })
  const MPCWallet = await import('../wasm')
  let apikeycreator = ''

  // paillier key not verified yet.
  if (paillierPKs.has(secret) === false) {
    let resolver: (s: string) => void = () => null
    paillierPKs.set(
      secret,
      new Promise(r => {
        resolver = r
      })
    )
    const [initSuccess, apiKeyCreatorOrError1] = JSON.parse(MPCWallet.init_apikeycreator(secret)) as [boolean, string]
    if (initSuccess === false) {
      throw new Error('ERROR: initalization failed. ' + apiKeyCreatorOrError1)
    } else {
      apikeycreator = JSON.stringify(apiKeyCreatorOrError1)
      const response = await generateProofFn({})
      const correctKeyProof = JSON.stringify(response.correct_key_proof)
      const paillierPK = JSON.stringify(response.paillier_pk)
      resolver(paillierPK)
      const [verifyPaillierSuccess, apiKeyCreatorOrError2] = JSON.parse(
        MPCWallet.verify_paillier(apikeycreator, paillierPK, correctKeyProof)
      ) as [boolean, string]
      if (verifyPaillierSuccess === false) {
        throw new Error('ERROR: paillier key verification failed. ' + apiKeyCreatorOrError2)
      } else {
        apikeycreator = JSON.stringify(apiKeyCreatorOrError2)
      }
    }
    // paillier key already verified; skip verification
  } else {
    const previousPaillierPK = await paillierPKs.get(secret)!
    const [initApiKeyCreatorSuccess, initApiKeyWithCreatorStr] = JSON.parse(
      MPCWallet.init_apikeycreator_with_verified_paillier(secret, previousPaillierPK)
    ) as [boolean, string]
    if (initApiKeyCreatorSuccess === false) {
      throw new Error('ERROR: (fast) initalization failed. ' + initApiKeyWithCreatorStr)
    } else {
      apikeycreator = JSON.stringify(initApiKeyWithCreatorStr)
    }
  }

  const [createKeySuccess, apiKeyOrError] = JSON.parse(MPCWallet.create_api_key(apikeycreator)) as
    | [false, string]
    | [true, SignKey]
  if (createKeySuccess === false) {
    throw new Error('ERROR: paillier key not verified. ' + apiKeyOrError)
  } else {
    return apiKeyOrError as SignKey
  }
}
