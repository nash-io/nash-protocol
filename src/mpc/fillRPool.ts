import { MPCWalletModulePromise } from './wasmModule'
import { postAndGetBodyAsJSON } from './utils'
import { EllipticCurvePoint } from '../types/EllipticCurvePoint'
import { FillRPoolParams } from '../types/MPC'

const RPOOL_SIZE = 10
const MIN_RPOOL_SIZE = RPOOL_SIZE / 2

export async function fillRPool({ fillPoolUrl }: FillRPoolParams): Promise<void> {
  const MPCwallet = await MPCWalletModulePromise
  const [initDHSuccess, clientDHSecrets, clientDHPublics] = JSON.parse(MPCwallet.dh_init(RPOOL_SIZE)) as [
    boolean,
    string[],
    EllipticCurvePoint[]
  ]
  if (initDHSuccess === false) {
    throw new Error('ERROR: DH init failed. ' + clientDHSecrets)
  }

  const serverDHPublics = await postAndGetBodyAsJSON(fillPoolUrl, {
    client_dh_publics: JSON.stringify(clientDHPublics)
  })

  const [fillRpoolSuccess, msg] = JSON.parse(
    MPCwallet.fill_rpool(JSON.stringify(clientDHSecrets), serverDHPublics)
  ) as [boolean, string]
  if (fillRpoolSuccess === false) {
    throw new Error('ERROR: computing r_pool failed: ' + msg)
  }
}

export async function fillRPoolIfNeeded(fillPoolParams: FillRPoolParams): Promise<void> {
  const MPCwallet = await MPCWalletModulePromise
  const [getRPoolSizeOk, size] = JSON.parse(MPCwallet.get_rpool_size()) as [boolean, number | string]
  if (getRPoolSizeOk === true) {
    const rpoolSize = size as number
    if (rpoolSize < MIN_RPOOL_SIZE) {
      await fillRPool(fillPoolParams)
    }
  } else {
    throw new Error('Error querying rpool size. ' + (size as string))
  }
}
