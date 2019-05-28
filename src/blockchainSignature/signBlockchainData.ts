import { Config, BlockchainSignature } from '../types'
import { buildNEOBlockchainSignatureData, signNEOBlockchainData } from './signNEOBlockchainData'
import { buildETHBlockchainSignatureData, signETHBlockchainData } from './signETHBlockchainData'
import { PayloadAndKind } from '../payload'

export default function createSignatureForBlockchain(
  config: Config,
  blockchain: string,
  payloadAndKind: PayloadAndKind
): BlockchainSignature {
  switch (blockchain) {
    case 'neo':
      const neoData = buildNEOBlockchainSignatureData(config, payloadAndKind)
      return signNEOBlockchainData(config.wallets.neo.privateKey, neoData)
    case 'eth':
      const ethData = buildETHBlockchainSignatureData(config, payloadAndKind)
      return signETHBlockchainData(config.wallets.eth.privateKey, ethData)
    default:
      throw new Error(`signatures for blockchain (${blockchain} is not supported`)
  }
}
