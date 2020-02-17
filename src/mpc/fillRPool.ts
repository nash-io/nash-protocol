import { EllipticCurvePoint } from '../types/EllipticCurvePoint'
import { FillRPoolParams } from '../types/MPC'

const RPOOL_SIZE = 10
const MIN_RPOOL_SIZE = RPOOL_SIZE / 2

export async function fillRPool({ fillPoolFn, curve }: FillRPoolParams): Promise<void> {
  const MPCWallet = await import('../wasm')
  const [initDHSuccess, clientDHSecrets, clientDHPublics] = JSON.parse(
    MPCWallet.dh_init(RPOOL_SIZE, JSON.stringify(curve))
  ) as [boolean, string[], EllipticCurvePoint[]]
  if (initDHSuccess === false) {
    throw new Error('ERROR: DH init failed. ' + clientDHSecrets)
  }

  const serverDHPublics = await fillPoolFn({
    client_dh_publics: clientDHPublics,
    curve
  })

  const [fillRpoolSuccess, msg] = JSON.parse(
    MPCWallet.fill_rpool(JSON.stringify(clientDHSecrets), JSON.stringify(serverDHPublics), JSON.stringify(curve))
  ) as [boolean, string]
  if (fillRpoolSuccess === false) {
    throw new Error('ERROR: computing r_pool failed: ' + msg)
  }
}

export async function fillRPoolIfNeeded(fillPoolParams: FillRPoolParams): Promise<void> {
  const MPCWallet = await import('../wasm')
  const [getRPoolSizeSuccess, msgOrSize] = JSON.parse(
    MPCWallet.get_rpool_size(JSON.stringify(fillPoolParams.curve))
  ) as [boolean, number | string]
  if (getRPoolSizeSuccess === true) {
    const rpoolSize = msgOrSize as number
    if (rpoolSize < MIN_RPOOL_SIZE) {
      await fillRPool(fillPoolParams)
    }
  } else {
    throw new Error('Error querying rpool size. ' + (msgOrSize as string))
  }
}
