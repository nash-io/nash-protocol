import { MPCWalletModulePromise } from './wasmModule'
import { postAndGetBodyAsJSON } from './utils'
import { fillRPoolIfNeeded } from './fillRPool'
import { CreateApiKeyResult, CreateApiKeyParams } from '../types/MPC'

// Do we need to cache this key?
let paillierPK: false | string = false

export async function createAPIKey({
  secret,
  fillPoolUrl,
  generateProofUrl
}: CreateApiKeyParams): Promise<CreateApiKeyResult> {
  await fillRPoolIfNeeded({ fillPoolUrl })
  const MPCwallet = await MPCWalletModulePromise
  let apikeycreator = ''
  const [publicKeyFromSecretKeySuccess, publicKeyResult] = JSON.parse(MPCwallet.publickey_from_secretkey(secret)) as [
    boolean,
    string
  ]
  if (publicKeyFromSecretKeySuccess === false) {
    throw new Error('Error deriving public key from secret key.')
  }
  const publicKey = JSON.stringify(publicKeyResult)

  // paillier key not verified yet.
  if (paillierPK === false) {
    const [initSuccess, apiKeyCreatorOrError1] = JSON.parse(MPCwallet.init_apikeycreator(secret)) as [boolean, string]
    if (initSuccess === false) {
      throw new Error('ERROR: initalization failed. ' + apiKeyCreatorOrError1)
    } else {
      apikeycreator = JSON.stringify(apiKeyCreatorOrError1)
      const response = await postAndGetBodyAsJSON(generateProofUrl, {})
      const correctKeyProof = JSON.stringify(response.correct_key_proof)
      paillierPK = JSON.stringify(response.paillier_pk)

      const [verifyPaillierSuccess, apiKeyCreatorOrError2] = JSON.parse(
        MPCwallet.verify_paillier(apikeycreator, paillierPK, correctKeyProof)
      ) as [boolean, string]
      if (verifyPaillierSuccess === false) {
        throw new Error('ERROR: paillier key verification failed. ' + apiKeyCreatorOrError2)
      } else {
        apikeycreator = JSON.stringify(apiKeyCreatorOrError2)
      }
    }
    // paillier key already verified; skip verification
  } else {
    const [initApiKeyCreatorSuccess, initApiKeyWithCreatorStr] = JSON.parse(
      MPCwallet.init_apikeycreator_with_verified_paillier(secret, paillierPK)
    ) as [boolean, string]
    if (initApiKeyCreatorSuccess === false) {
      throw new Error('ERROR: (fast) initalization failed. ' + initApiKeyWithCreatorStr)
    } else {
      apikeycreator = JSON.stringify(initApiKeyWithCreatorStr)
    }
  }

  const [createKeySuccess, apiKeyOrError] = JSON.parse(MPCwallet.create_api_key(apikeycreator)) as [boolean, string]
  if (createKeySuccess === false) {
    throw new Error('ERROR: paillier key not verified. ' + apiKeyOrError)
  } else {
    const apiKey = JSON.stringify(apiKeyOrError)
    return { apiKey, publicKey }
  }
}
