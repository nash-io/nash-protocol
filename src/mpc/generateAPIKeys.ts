import { createAPIKey } from './createAPIKey'
import { GenerateApiKeysParams, BIP44, APIKey } from '../types/MPC'
import secretKeyToMnemonic from '../secretKeyToMnemonic'
import { Wallet } from '../types'
import bufferize from '../bufferize'
import mnemonicToMasterSeed from '../mnemonicToMasterSeed'
import { generateNashPayloadSigningKey, generateWallet, coinTypeFromString } from '../generateWallet'
import keccak from 'keccak'

function toChecksumAddress(address: string): string {
  const hash = keccak('keccak256')
    .update(address)
    .digest()
    .toString('hex')
  let ret = '0x'

  for (let i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase()
    } else {
      ret += address[i]
    }
  }

  return ret
}

// Generates API keys based on https://www.notion.so/nashio/RFC-API-key-representation-cf619be1c8b045f9a5f2596261c8039b
export async function generateAPIKeys(params: GenerateApiKeysParams): Promise<APIKey> {
  const btc = await createAPIKey(params)
  const eth = await createAPIKey(params)
  const neo = await createAPIKey(params)

  const secretBuff = bufferize(params.secret)
  const masterSeed = mnemonicToMasterSeed(secretKeyToMnemonic(secretBuff))
  const payloadSigningKey = generateNashPayloadSigningKey(masterSeed, 1)

  const wallets: Record<string, Wallet> = {}
  for (const [name, index] of Object.entries(params.walletIndices)) {
    wallets[name] = generateWallet(masterSeed, coinTypeFromString(name), index, params.net)
  }

  return {
    child_keys: {
      [BIP44.BTC]: {
        client_secret_share: btc.client_secret_share,
        public_address: wallets.btc.address,
        public_key: wallets.btc.publicKey,
        server_secret_share_encrypted: btc.server_secret_share_encrypted
      },
      [BIP44.ETH]: {
        client_secret_share: eth.client_secret_share,
        public_address: toChecksumAddress(wallets.eth.address),
        public_key: wallets.eth.publicKey,
        server_secret_share_encrypted: eth.server_secret_share_encrypted
      },
      [BIP44.NEO]: {
        client_secret_share: neo.client_secret_share,
        public_address: wallets.neo.address,
        public_key: wallets.neo.publicKey,
        server_secret_share_encrypted: neo.server_secret_share_encrypted
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
