import { FillRPoolParams, BlockchainCurve } from '../types/MPC'

const RPOOL_SIZE = 100
const MIN_RPOOL_SIZE = 49
const BLOCK_RPOOL_SIZE = 5

async function getDhPoolSize(fillPoolParams: FillRPoolParams): Promise<number> {
  const MPCWallet = await import('../mpc-lib')
  const curveStr = JSON.stringify(BlockchainCurve[fillPoolParams.blockchain])
  const [getRPoolSizeSuccess, msgOrSize] = JSON.parse(MPCWallet.get_rpool_size(curveStr)) as [boolean, number | string]
  if (getRPoolSizeSuccess === false) {
    throw new Error('Error querying rpool size. ' + (msgOrSize as string))
  }
  return msgOrSize as number
}

let _FILL_JOB: null | Promise<void> = null
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
async function fill(fillPoolParams: FillRPoolParams): Promise<void> {
  if (_FILL_JOB == null) {
    _FILL_JOB = _fill(fillPoolParams)
    await _FILL_JOB
    _FILL_JOB = null
  } else {
    await _FILL_JOB
  }
}

async function fillToMax(args: FillRPoolParams): Promise<void> {
  while (true) {
    const poolSize = await getDhPoolSize(args)
    if (RPOOL_SIZE <= poolSize) {
      break
    }
    await fill(args)
  }
}

export async function fillRPool(args: FillRPoolParams): Promise<void> {
  const initialPoolSize = await getDhPoolSize(args)
  if (RPOOL_SIZE <= initialPoolSize) {
    return
  }
  await fill(args)
  fillToMax(args)
}

export async function fillRPoolIfNeeded(fillPoolParams: FillRPoolParams): Promise<void> {
  const rpoolSize = await getDhPoolSize(fillPoolParams)
  if (rpoolSize > MIN_RPOOL_SIZE) {
    fillRPool(fillPoolParams)
    return
  }
  const p = fillRPool(fillPoolParams)
  if (rpoolSize < BLOCK_RPOOL_SIZE) {
    await p
  }
  return
}
