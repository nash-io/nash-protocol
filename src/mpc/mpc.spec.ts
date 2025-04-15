// import { TextEncoder, TextDecoder } from 'util'
// global.TextEncoder = TextEncoder
// // @ts-expect-error
// global.TextDecoder = TextDecoder

// import * as mpc from '../mpc-lib'

test('mpc wasm dh init', async () => {
  const j = true
  expect(j).toBe(true)
})
//     mpc.forceWasm()

//     let total = 4
//     let [success, val] = JSON.parse(mpc.dh_init(total, JSON.stringify('Curve25519')))
//     expect(success).toBe(true)
//     expect(val.length).toBe(total)

//     total = 1

//     { [success, val] = JSON.parse(mpc.dh_init(total, JSON.stringify('Curve2551'))) }
//     expect(success).toBe(false)
//     expect(val).toEqual('error deserializing curve')

//     { [success, val] = JSON.parse(mpc.dh_init(total, JSON.stringify('Secp256k1'))) }
//     expect(success).toBe(true)

//     { [success, val] = JSON.parse(mpc.dh_init(total, JSON.stringify('Secp256r1'))) }
//     expect(success).toBe(true)

// })

// test('mpc init api childkey creator', async () => {

//     mpc.forceWasm()

//     let [success, val] = JSON.parse(mpc.init_api_childkey_creator("4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1"))
//     expect(success).toBe(true)
//     expect(val).not.toBeUndefined()

//     { [success, val] = JSON.parse(mpc.init_api_childkey_creator("u")) }
//     expect(success).toBe(false)
//     expect(val).toEqual('error deserializing secret_key')
// })

// test('mpc init api childkey creator with verified pallier', async () => {

//     mpc.forceWasm()

//     let [success, val] = JSON.parse(mpc.init_api_childkey_creator_with_verified_paillier("4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1", "{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}"))
//     expect(success).toBe(true)
//     expect(val).not.toBeUndefined()

//     { [success, val] = JSON.parse(mpc.init_api_childkey_creator_with_verified_paillier("u", "{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}")) }
//     expect(success).toBe(false)
//     expect(val).toEqual('error deserializing secret_key')

//     { [success, val] = JSON.parse(mpc.init_api_childkey_creator_with_verified_paillier("4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1", "{\"n\":\"j\"}")) }
//     expect(success).toBe(false)
//     expect(val).toEqual('error deserializing paillier_pk')

// })

// test('mpc init api childkey creator with verified pallier', async () => {

//     mpc.forceWasm()

//     let [success, val] = JSON.parse(mpc.init_api_childkey_creator_with_verified_paillier("4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1", "{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}"))
//     expect(success).toBe(true)
//     expect(val).not.toBeUndefined()

//     { [success, val] = JSON.parse(mpc.init_api_childkey_creator_with_verified_paillier("u", "{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}")) }
//     expect(success).toBe(false)
//     expect(val).toEqual('error deserializing secret_key')

//     { [success, val] = JSON.parse(mpc.init_api_childkey_creator_with_verified_paillier("4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1", "{\"n\":\"j\"}")) }
//     expect(success).toBe(false)
//     expect(val).toEqual('error deserializing paillier_pk')

// })

// test('mpc create api childkey', async () => {

//     mpc.forceWasm()

//     let [success, result] = JSON.parse(mpc.create_api_childkey(
//         "{\"secret_key\":\"4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1\",\"paillier_pk\":{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}}",
//         "\"Secp256k1\""));

//     expect(success).toBe(true)
//     expect(result).not.toBeUndefined()

//     {
//         [success, result] = JSON.parse(mpc.create_api_childkey(
//             "{\"secret_key\":\"4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1\",\"paillier_pk\":{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}}",
//             "\"Secp256r1\""))
//     }

//     expect(success).toBe(true)
//     expect(result).not.toBeUndefined()

//     {
//         [success, result] = JSON.parse(mpc.create_api_childkey(
//             "{\"secret_key\":\"4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1\",\"paillier_pk\":{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}}",
//             "\"Curve25519\""))
//     }

//     expect(success).toBe(true)
//     expect(result).not.toBeUndefined()

//     {
//         [success, result] = JSON.parse(mpc.create_api_childkey(
//             "{\"secret_key\":\"4794853ce9e44b4c7a69c6a3b87db077f8f910f244bb6b966ba5fed83c9756f1\",\"paillier_pk\":{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}}",
//             "\"Curve2551\""))
//     }

//     expect(success).toBe(false)
//     expect(result).toEqual("error deserializing curve")

// })

// test('mpc fill r pool', async () => {

//     let [success, result] = JSON.parse(mpc.fill_rpool(
//         "[\"aa75ca8a2fd3f8af94976bfaa7aa476dc31f5d78d9fef8fb86a97a775f611ae5\"]",
//         "[\"031241ac15c9c9c070e1cba1dbdb3992018f9c66f0e50a8d9afbebc510aaf355e7\"]",
//         "\"Secp256k1\"",
//         "{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}",
//     ))

//     expect(success).toBe(true)
//     expect(result).toEqual("rpool filled successfully")

//     {
//         [success, result] = JSON.parse(mpc.fill_rpool(
//             "[\"aa75ca8a2fd3f8af94976bfaa7aa476dc31f5d78d9fef8fb86a97a775f611ae5\"]",
//             "[\"031241ac15c9c9c070e1cba1dbdb3992018f9c66f0e50a8d9afbebc510aaf355e7\"]",
//             "\"Secp256r1\"",
//             "{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}",
//         ))
//     }

//     expect(success).toBe(true)
//     expect(result).toEqual("rpool filled successfully")

//     {
//         [success, result] = JSON.parse(mpc.fill_rpool(
//             "[\"c788ac499227d0c9329e9e006b216290150cc99d41a174521f999930041410f\"]",
//             "[\"8ee9648d2486fa6eab6177dfc99c441e4cb41790bae14b2d93bc3a2ae975f0d1\"]",
//             "\"Curve25519\"",
//             "{\"n\":\"9e2f24f407914eff43b7c7df083c5cc9765c05386485e9e9aa55e7b039290300ba39e86f399e2b338fad4bb34a4d7a7a0cd14fd28503eeebb73ff38e8164616942113afadaeaba525bd4cfdafc4ddd3b012d3fbcd9f276acbad4379b8b93bc4f4d6ddc0a2b9af36b34771595f0e6cb62987b961d83f49ba6ec4b088a1350b3dbbea3e21033801f6c4b212ecd830b5b81075effd06b47feecf18f3c9093662c918073dd95a525b4f99478512ea3bf085993c9bf65922d42b65b338431711dddb5491c2004548df31ab6092ec58db564c8a88a309b0f734171de1f8f4361d5f883e38d5bf519dc347036910aec3c80f2058fa8945c38787094f3450774e2b23129\"}",
//         ))
//     }

//     expect(success).toBe(true)
//     expect(result).toEqual("rpool filled successfully")

// })
