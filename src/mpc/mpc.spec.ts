import { createAPIKey } from './generateAPIKeys'
import { computePresig } from './computePresig'
import { fillRPool } from './fillRPool'

import { postAndGetBodyAsJSON } from './utils'
import { MPCWalletModulePromise } from './wasmModule'

const DH_FILL_POOL_URL = 'http://localhost:4000/api/v1/dh_fill_pool'
const GENERATE_PAILLIER_PROOF_URL = 'http://localhost:4000/api/v1/generate_paillier_proof'
const COMPLETE_SIGNATURE_URL = 'http://localhost:4000/api/v1/complete_sig'

const messageHash = '0000000000000000fffffffffffffffffff00000000000000ffffffffff000000'
const secret = '4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1'

test('Can compute a presignature', async () => {
  await fillRPool({ fillPoolUrl: DH_FILL_POOL_URL })
  const { apiKey, publicKey } = await createAPIKey({
    fillPoolUrl: DH_FILL_POOL_URL,
    generateProofUrl: GENERATE_PAILLIER_PROOF_URL,
    secret
  })
  const presig = await computePresig({
    apiKey,
    messageHash
  })

  // Lets verify that the presig is valid
  const signature = await postAndGetBodyAsJSON(COMPLETE_SIGNATURE_URL, {
    presig: JSON.stringify(presig.presig),
    r: JSON.stringify(presig.r)
  })

  const MPCWallet = await MPCWalletModulePromise
  const [verifyOk] = JSON.parse(MPCWallet.verify(JSON.stringify(signature), publicKey, messageHash)) as [
    boolean,
    string
  ]
  expect(verifyOk).toBe(true)
})
