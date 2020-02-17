import { fillRPoolIfNeeded } from './fillRPool'
import { ComputePresigParams, Presignature } from '../types/MPC'

export async function computePresig(params: ComputePresigParams): Promise<Presignature> {
  await fillRPoolIfNeeded({
    curve: params.curve,
    fillPoolFn: params.fillPoolFn
  })
  const MPCWallet = await import('../wasm')

  const [comutePresigOk, presigOrErrorMessage, r] = JSON.parse(
    MPCWallet.compute_presig(JSON.stringify(params.apiKey), params.messageHash, JSON.stringify(params.curve))
  ) as [boolean, string, string]
  if (comutePresigOk === false) {
    throw new Error('Error computing presig: ' + presigOrErrorMessage)
  }
  return {
    presig: presigOrErrorMessage,
    r
  }
}
