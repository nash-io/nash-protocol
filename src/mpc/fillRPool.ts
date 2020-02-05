import { MPCWalletModulePromise } from './wasmModule'
import { EllipticCurvePoint } from '../types/EllipticCurvePoint'
import { FillRPoolParams } from '../types/MPC'

const RPOOL_SIZE = 10
const MIN_RPOOL_SIZE = RPOOL_SIZE / 2

export async function fillRPool({ fillPoolFn }: FillRPoolParams): Promise<void> {
  const MPCwallet = await MPCWalletModulePromise
  const [initDHSuccess, clientDHSecrets, clientDHPublics] = JSON.parse(MPCwallet.dh_init(RPOOL_SIZE)) as [
    boolean,
    string[],
    EllipticCurvePoint[]
  ]
  if (initDHSuccess === false) {
    throw new Error('ERROR: DH init failed. ' + clientDHSecrets)
  }

  const serverDHPublics = await fillPoolFn({
    client_dh_publics: clientDHPublics
  })

  const [fillRpoolSuccess, msg] = JSON.parse(
    MPCwallet.fill_rpool(JSON.stringify(clientDHSecrets), JSON.stringify(serverDHPublics))
  ) as [boolean, string]
  if (fillRpoolSuccess === false) {
    throw new Error('ERROR: computing r_pool failed: ' + msg)
  }
}

export async function fillRPoolIfNeeded(fillPoolParams: FillRPoolParams): Promise<void> {
  const MPCwallet = await MPCWalletModulePromise
  const [getRPoolSizeSuccess, msgOrSize] = JSON.parse(MPCwallet.get_rpool_size()) as [boolean, number | string]
  if (getRPoolSizeSuccess === true) {
    const rpoolSize = msgOrSize as number
    if (rpoolSize < MIN_RPOOL_SIZE) {
      await fillRPool(fillPoolParams)
    }
  } else {
    throw new Error('Error querying rpool size. ' + (msgOrSize as string))
  }
}
