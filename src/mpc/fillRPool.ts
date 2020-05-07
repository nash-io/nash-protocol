import { FillRPoolParams, BlockchainCurve, Curve } from '../types/MPC'

const RPOOL_SIZE = 100
const MIN_RPOOL_SIZE = 50
const BLOCK_RPOOL_SIZE = 8

async function getDhPoolSize(fillPoolParams: FillRPoolParams): Promise<number> {
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
  const { fillPoolFn, blockchain } = fillPoolParams
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
    MPCWallet.fill_rpool(JSON.stringify(clientDHSecrets), JSON.stringify(serverDHPublics), curveStr)
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
  while (true) {
    const rpoolSize = await getDhPoolSize(fillPoolParams)
    if (rpoolSize > MIN_RPOOL_SIZE) {
      return
    }
    const p = fillRPool(fillPoolParams)
    if (rpoolSize >= BLOCK_RPOOL_SIZE) {
      return
    }
    await p
  }
}
