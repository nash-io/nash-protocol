import { createAPIKey } from './createAPIKey'
import { GenerateApiKeysParams, BIP44, APIKey, Blockchain } from '../types/MPC'
import secretKeyToMnemonic from '../secretKeyToMnemonic'
import bufferize from '../bufferize'
import mnemonicToMasterSeed from '../mnemonicToMasterSeed'
import { generateNashPayloadSigningKey, generateWallet, coinTypeFromString } from '../generateWallet'

// Generates API keys based on https://www.notion.so/nashio/RFC-API-key-representation-cf619be1c8b045f9a5f2596261c8039b
export async function generateAPIKeys(params: GenerateApiKeysParams): Promise<APIKey> {
  const secretBuff = bufferize(params.secret)
  const masterSeed = mnemonicToMasterSeed(secretKeyToMnemonic(secretBuff))
  const payloadSigningKey = generateNashPayloadSigningKey(masterSeed, 1)

  const btcWallet = generateWallet(
    masterSeed,
    coinTypeFromString('btc'),
    params.walletIndices.btc,
    params.net,
    Blockchain.BTC
  )
  const ethWallet = generateWallet(
    masterSeed,
    coinTypeFromString('eth'),
    params.walletIndices.eth,
    params.net,
    Blockchain.ETH
  )
  const neoWallet = generateWallet(
    masterSeed,
    coinTypeFromString('neo'),
    params.walletIndices.neo,
    params.net,
    Blockchain.NEO
  )
  const avaxcWallet = generateWallet(
    masterSeed,
    coinTypeFromString('avaxc'),
    params.walletIndices.avaxc,
    params.net,
    Blockchain.AVAXC
  )
  const polygonWallet = generateWallet(
    masterSeed,
    coinTypeFromString('polygon'),
    params.walletIndices.polygon,
    params.net,
    Blockchain.POLYGON
  )
  const neo3Wallet = generateWallet(
    masterSeed,
    coinTypeFromString('neo3'),
    params.walletIndices.neo3,
    params.net,
    Blockchain.NEO3
  )

  const btcSecret = btcWallet.privateKey
  const ethSecret = ethWallet.privateKey
  const neoSecret = neoWallet.privateKey
  const avaxcSecret = avaxcWallet.privateKey
  const polygonSecret = polygonWallet.privateKey
  const neo3Secret = neo3Wallet.privateKey

  const btc = await createAPIKey({
    ...params,
    curve: 'Secp256k1',
    secret: btcSecret
  })
  const eth = await createAPIKey({
    ...params,
    curve: 'Secp256k1',
    secret: ethSecret
  })
  const neo = await createAPIKey({
    ...params,
    curve: 'Secp256r1',
    secret: neoSecret
  })
  const avaxc = await createAPIKey({
    ...params,
    curve: 'Secp256k1',
    secret: avaxcSecret
  })
  const polygon = await createAPIKey({
    ...params,
    curve: 'Secp256k1',
    secret: polygonSecret
  })
  const neo3 = await createAPIKey({
    ...params,
    curve: 'Secp256r1',
    secret: neo3Secret
  })
  return {
    child_keys: {
      [BIP44.BTC]: {
        address: btcWallet.address,
        client_secret_share: btc.client_secret_share,
        public_key: btcWallet.publicKey,
        server_secret_share_encrypted: btc.server_secret_share_encrypted
      },
      [BIP44.ETH]: {
        address: ethWallet.address,
        client_secret_share: eth.client_secret_share,
        public_key: ethWallet.publicKey,
        server_secret_share_encrypted: eth.server_secret_share_encrypted
      },
      [BIP44.NEO]: {
        address: neoWallet.address,
        client_secret_share: neo.client_secret_share,
        public_key: neoWallet.publicKey,
        server_secret_share_encrypted: neo.server_secret_share_encrypted
      },
      [BIP44.AVAXC]: {
        address: avaxcWallet.address,
        client_secret_share: avaxc.client_secret_share,
        public_key: avaxcWallet.publicKey,
        server_secret_share_encrypted: avaxc.server_secret_share_encrypted
      },
      [BIP44.POLYGON]: {
        address: polygonWallet.address,
        client_secret_share: polygon.client_secret_share,
        public_key: polygonWallet.publicKey,
        server_secret_share_encrypted: polygon.server_secret_share_encrypted
      },
      [BIP44.NEO3]: {
        address: neo3Wallet.address,
        client_secret_share: neo3.client_secret_share,
        public_key: neo3Wallet.publicKey,
        server_secret_share_encrypted: neo3.server_secret_share_encrypted
      }
    },
    paillier_pk: btc.paillier_pk,
    payload_public_key: payloadSigningKey.publicKey,
    payload_signing_key: payloadSigningKey.privateKey,
    version: 0
  }
}

export function encodeApiKeys(key: APIKey): string {
  return Buffer.from(JSON.stringify(key), 'utf-8').toString('base64')
}

export function decodeAPIKeys(encoded: string): APIKey {
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'))
}
