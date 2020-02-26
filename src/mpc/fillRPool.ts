import { FillRPoolParams, BlockchainCurve } from '../types/MPC'

const RPOOL_SIZE = 50
const MIN_RPOOL_SIZE = 5

export async function fillRPool({ fillPoolFn, blockchain }: FillRPoolParams): Promise<void> {
  const MPCWallet = await import('../wasm')
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

export async function fillRPoolIfNeeded(fillPoolParams: FillRPoolParams): Promise<void> {
  const MPCWallet = await import('../wasm')
  const curveStr = JSON.stringify(BlockchainCurve[fillPoolParams.blockchain])
  while (true) {
    const [getRPoolSizeSuccess, msgOrSize] = JSON.parse(MPCWallet.get_rpool_size(curveStr)) as [
      boolean,
      number | string
    ]
    if (getRPoolSizeSuccess === true) {
      const rpoolSize = msgOrSize as number
      if (rpoolSize < MIN_RPOOL_SIZE) {
        await fillRPool(fillPoolParams)
      } else {
        break
      }
    } else {
      throw new Error('Error querying rpool size. ' + (msgOrSize as string))
    }
  }
}
