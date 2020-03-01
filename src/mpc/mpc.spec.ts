// import fetch from 'node-fetch'

// import { createAPIKey } from './createAPIKey'
// import { computePresig } from './computePresig'
// import { publicKeyFromSecretKey } from './publicKeyFromSecretKey'

// import { FillPoolFn, Blockchain, BlockchainCurve, GenerateProofFn } from '../types/MPC'

// const postAndGetBodyAsJSON = async (url: string, obj: object): Promise<any> => {
//   const resp = await fetch(url, {
//     body: JSON.stringify(obj),
//     headers: { 'Content-Type': 'application/json' },
//     method: 'post'
//   })

//   return resp.json()
// }

// const blockchain = Blockchain.NEO
// const curve = BlockchainCurve[blockchain]
// const COMPLETE_SIGNATURE_URL = 'http://localhost:4000/api/v1/complete_sig'

// const messageHash = '0000000000000000fffffffffffffffffff00000000000000ffffffffff000000'
// const secret = '2d445d1fc2377e8dac6b02b4b459d39c'

// const fillPoolFn: FillPoolFn = async arg => {
//   const args = {
//     client_dh_publics: JSON.stringify(arg.client_dh_publics),
//     curve: JSON.stringify(BlockchainCurve[arg.blockchain])
//   }
//   const resp = JSON.parse(await postAndGetBodyAsJSON('http://localhost:4000/api/v1/dh_rpool', args)) as ReturnType<
//     FillPoolFn
//   >
//   return resp
// }

// const generateProofFn: GenerateProofFn = async arg => {
//   const resp = await (postAndGetBodyAsJSON(
//     'http://localhost:4000/api/v1/get_paillier_keypair_and_proof',
//     arg
//   ) as Promise<ReturnType<GenerateProofFn>>)
//   return resp
// }

// describe('mpc', () => {
//   test('Can compute a presignature', async () => {
//     const publicKey = await publicKeyFromSecretKey({ secret, curve })
//     const apiKey = await createAPIKey({
//       curve,
//       generateProofFn,
//       secret
//     })

//     const presig = await computePresig({
//       apiKey,
//       blockchain,
//       fillPoolFn,
//       messageHash
//     })
//     // Lets verify that the presig is valid
//     const signature = (await postAndGetBodyAsJSON(COMPLETE_SIGNATURE_URL, {
//       curve: JSON.stringify(curve),
//       presig: presig.presig,
//       r: presig.r
//     })) as { r: string; s: string }
//     const MPCWallet = await import('../wasm')
//     const [verifyOk] = JSON.parse(
//       MPCWallet.verify(signature.r, signature.s, JSON.stringify(publicKey), messageHash, JSON.stringify(curve))
//     ) as [boolean, string]
//     expect(verifyOk).toBe(true)
//   })
// })
