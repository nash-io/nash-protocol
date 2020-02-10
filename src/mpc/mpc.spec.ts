import fetch from 'node-fetch'

import { createAPIKey } from './createAPIKey'
import { computePresig } from './computePresig'
import { publicKeyFromSecretKey } from './publicKeyFromSecretKey'
import { fillRPool } from './fillRPool'

import { FillPoolFn, GenerateProofFn } from '../types/MPC'

const postAndGetBodyAsJSON = async (url: string, obj: object): Promise<any> => {
  const resp = await fetch(url, {
    body: JSON.stringify(obj),
    headers: { 'Content-Type': 'application/json' },
    method: 'post'
  })

  return resp.json()
}

const COMPLETE_SIGNATURE_URL = 'http://localhost:4000/api/v1/complete_sig'

const messageHash = '0000000000000000fffffffffffffffffff00000000000000ffffffffff000000'
const secret = '4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1'

const fillPoolFn: FillPoolFn = async arg => {
  const resp = JSON.parse(
    await postAndGetBodyAsJSON('http://localhost:4000/api/v1/dh_fill_pool', {
      client_dh_publics: JSON.stringify(arg.client_dh_publics)
    })
  ) as ReturnType<FillPoolFn>
  return resp
}

const generateProofFn: GenerateProofFn = async arg => {
  const resp = (await postAndGetBodyAsJSON('http://localhost:4000/api/v1/generate_paillier_proof', arg)) as Promise<
    ReturnType<GenerateProofFn>
  >
  return resp
}

describe('mpc', () => {
  test('Can compute a presignature', async () => {
    await fillRPool({ fillPoolFn })
    const publicKey = await publicKeyFromSecretKey({ secret })
    const apiKey = await createAPIKey({
      fillPoolFn,
      generateProofFn,
      secret
    })

    const presig = await computePresig({
      apiKey,
      fillPoolFn,
      messageHash
    })
    // Lets verify that the presig is valid
    const signature = (await postAndGetBodyAsJSON(COMPLETE_SIGNATURE_URL, {
      presig: JSON.stringify(presig.presig),
      r: JSON.stringify(presig.r)
    })) as { r: string; s: string }
    const MPCWallet = await import('../wasm')
    const [verifyOk] = JSON.parse(
      MPCWallet.verify(signature.r, signature.s, JSON.stringify(publicKey), messageHash)
    ) as [boolean, string]
    expect(verifyOk).toBe(true)
  })
})
