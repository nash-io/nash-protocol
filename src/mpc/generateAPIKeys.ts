import { createAPIKey } from './createAPIKey'
import { CreateApiKeyParams, BIP44, APIKey } from '../types/MPC'

// Generates API keys based on https://www.notion.so/nashio/RFC-API-key-representation-cf619be1c8b045f9a5f2596261c8039b
export async function generateAPIKeys(params: CreateApiKeyParams): Promise<APIKey> {
  const btc = await createAPIKey(params)
  const eth = await createAPIKey(params)
  const neo = await createAPIKey(params)
  const gqlauth = await createAPIKey(params)

  return {
    child_keys: {
      [BIP44.BTC]: {
        client_secret_share: btc.client_secret_share,
        server_secret_share_encrypted: btc.server_secret_share_encrypted
      },
      [BIP44.ETH]: {
        client_secret_share: eth.client_secret_share,
        server_secret_share_encrypted: eth.server_secret_share_encrypted
      },
      [BIP44.NEO]: {
        client_secret_share: neo.client_secret_share,
        server_secret_share_encrypted: neo.server_secret_share_encrypted
      },
      [BIP44.GQLAUTH]: {
        client_secret_share: gqlauth.client_secret_share,
        server_secret_share_encrypted: gqlauth.server_secret_share_encrypted
      }
    },
    paillier_pk: btc.paillier_pk
  }
}

export function encodeApiKeys(key: APIKey): string {
  return Buffer.from(JSON.stringify(key), 'utf-8').toString('base64')
}

export function decodeAPIKeys(encoded: string): APIKey {
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'))
}
