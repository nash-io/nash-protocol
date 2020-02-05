import { MPCWalletModulePromise } from './wasmModule'
import { fillRPoolIfNeeded } from './fillRPool'
import { ComputePresigParams, Presignature } from '../types/MPC'

export async function computePresig(params: ComputePresigParams): Promise<Presignature> {
  await fillRPoolIfNeeded({
    fillPoolFn: params.fillPoolFn
  })
  const MPCWallet = await MPCWalletModulePromise

  const [comutePresigOk, presigOrErrorMessage, r] = JSON.parse(
    MPCWallet.compute_presig(JSON.stringify(params.apiKey), params.messageHash)
  ) as [boolean, string, string]
  if (comutePresigOk === false) {
    throw new Error('Error computing presig: ' + presigOrErrorMessage)
  }
  return {
    presig: presigOrErrorMessage,
    r
  }
}
