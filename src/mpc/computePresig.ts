import { fillRPoolIfNeeded } from './fillRPool'
import { ComputePresigParams, BlockchainCurve, Presignature } from '../types/MPC'

let MPCWallet

const getMPCWallet = async (): Promise<any> => {
  if (MPCWallet == null) {
    MPCWallet = await import('../mpc-lib')
  }
  return MPCWallet
}

export async function computePresig(params: ComputePresigParams): Promise<Presignature> {
  const wallet = await getMPCWallet()
  await fillRPoolIfNeeded({
    blockchain: params.blockchain,
    fillPoolFn: params.fillPoolFn,
    paillierPkStr: JSON.stringify(params.apiKey.paillier_pk)
  })

  const [comutePresigOk, presigOrErrorMessage, r] = JSON.parse(
    wallet.compute_presig(JSON.stringify(params.apiKey), params.messageHash, BlockchainCurve[params.blockchain])
  ) as [boolean, string, string]
  if (comutePresigOk === false) {
    throw new Error('Error computing presig: ' + presigOrErrorMessage)
  }
  return {
    presig: presigOrErrorMessage,
    r
  }
}
