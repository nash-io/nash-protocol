import { FillRPoolParams, BlockchainCurve, Curve } from '../types/MPC'

// A pool size of 100 is unsuitable for browser applications
// As the presigning takes half a minute
let RPOOL_SIZE = 100
let MIN_RPOOL_SIZE = 10
const BLOCK_RPOOL_SIZE = 4

// This can be used to reconfigure the pooling size to a more manageble levels
// We have a bunch of community users who attempt to use the SDK in the browser. So we should support this.
export const configurePoolSettings = (poolSize: number, minPoolSize?: number) => {
  RPOOL_SIZE = poolSize
  MIN_RPOOL_SIZE = Math.max(BLOCK_RPOOL_SIZE, minPoolSize || poolSize / 2)
}

export async function getDhPoolSize(fillPoolParams: FillRPoolParams): Promise<number> {
  const MPCWallet = await import('../mpc-lib')
  const curveStr = JSON.stringify(BlockchainCurve[fillPoolParams.blockchain])
  const [getRPoolSizeSuccess, msgOrSize] = JSON.parse(MPCWallet.get_rpool_size(curveStr)) as [boolean, number | string]
  if (getRPoolSizeSuccess === false) {
    throw new Error('Error querying rpool size. ' + (msgOrSize as string))
  }
  return msgOrSize as number
}

const _FILL_JOB: Record<Curve, Promise<void> | null> = {
  Secp256k1: null,
  Secp256r1: null
}

async function _fill(fillPoolParams: FillRPoolParams): Promise<void> {
  const { fillPoolFn, blockchain, paillierPkStr } = fillPoolParams
  const MPCWallet = await import('../mpc-lib')
  const curveStr = JSON.stringify(BlockchainCurve[blockchain])
  const [initDHSuccess, clientDHSecrets, clientDHPublics] = JSON.parse(MPCWallet.dh_init(RPOOL_SIZE, curveStr)) as [
    boolean,
    string[],
    string[]
  ]

  if (initDHSuccess === false) {
    throw new Error('ERROR: DH init failed. ' + clientDHSecrets)
  }
  const serverDHPublics = await fillPoolFn({
    blockchain,
    client_dh_publics: clientDHPublics
  })
  const [fillRpoolSuccess, msg] = JSON.parse(
    MPCWallet.fill_rpool(JSON.stringify(clientDHSecrets), JSON.stringify(serverDHPublics), curveStr, paillierPkStr)
  ) as [boolean, string]
  if (fillRpoolSuccess === false) {
    throw new Error('ERROR: computing r_pool failed: ' + msg)
  }
}

export async function fillRPool(fillPoolParams: FillRPoolParams): Promise<void> {
  const { blockchain } = fillPoolParams
  const curve = BlockchainCurve[blockchain]
  if (_FILL_JOB[curve] == null) {
    _FILL_JOB[curve] = _fill(fillPoolParams)
    await _FILL_JOB[curve]
    _FILL_JOB[curve] = null
  } else {
    await _FILL_JOB[curve]
  }
}

export async function fillRPoolIfNeeded(fillPoolParams: FillRPoolParams): Promise<void> {
  const rpoolSize = await getDhPoolSize(fillPoolParams)
  if (rpoolSize > MIN_RPOOL_SIZE) {
    return
  }
  const p = fillRPool(fillPoolParams)
  if (rpoolSize <= BLOCK_RPOOL_SIZE) {
    await p
  }
}
