import os from 'os'
import process from 'process'
import {
  dh_init as wasm_dh_init,
  fill_rpool as wasm_fill_rpool,
  compute_presig as wasm_compute_presig,
  get_rpool_size as wasm_get_rpool_size,
  init_api_childkey_creator as wasm_init_api_childkey_creator,
  init_api_childkey_creator_with_verified_paillier as wasm_init_api_childkey_creator_with_verified_paillier,
  create_api_childkey as wasm_create_api_childkey,
  verify_paillier as wasm_verify_paillier,
  verify as wasm_verify,
  sign as wasm_sign,
  publickey_from_secretkey as wasm_publickey_from_secretkey
} from 'mpc-wallet-wasm'

let usingWasm = false


export function forceWasm(): void {
  usingWasm = true
}

interface NodeFileInterface {
  dh_init: (size: number, curve: string) => string
  fill_rpool: (clientDHSecrets: string, serverDHPublics: string, curve: string, pkstr: string) => string
  get_rpool_size: (curve: string) => string
  compute_presig: (apiKeyStr: string, msgHashStr: string, curve: string) => string
  sign: (secretkey: string, hash: string) => string
  //  publickey_from_secretkey: (secretkey: string, curve: string) => string
}

const loadNodeFile = (): NodeFileInterface | null => {
  if (usingWasm) {
    return null
  }

  const platform = os.platform()
  const arch = process.arch
  switch (platform) {
    // case 'aix':
    // case 'android':
    // case 'freebsd':
    // case 'openbsd':
    // case 'sunos':
    // case 'netbsd':
    case 'cygwin':
    case 'win32':
      return require(/* webpackIgnore: true */ './index_win.node')
    case 'linux':
      if (arch.startsWith('arm')) {
        return require(/* webpackIgnore: true */ './index_arm.node')
      }
      return require(/* webpackIgnore: true */ './index_linux.node')
    case 'darwin':
      if (arch.startsWith('arm')) {
        return require(/* webpackIgnore: true */ './index_osx_arm64.node')
      }
      return require(/* webpackIgnore: true */ './index_osx.node')
    default:
      console.log('Using .wasm shim')
      usingWasm = true
      return null
  }
}

const MpcWallet = loadNodeFile() as NodeFileInterface
export function dh_init(size: number, curve: string): string {
  if (usingWasm) {
    return wasm_dh_init(size, curve)
  }
  return MpcWallet.dh_init(size, curve)
}

export function fill_rpool(clientDHSecrets: string, serverDHPublics: string, curve: string, pkstr: string): string {
  if (usingWasm) {
    return wasm_fill_rpool(clientDHSecrets, serverDHPublics, curve, pkstr)
  }
  return MpcWallet.fill_rpool(clientDHSecrets, serverDHPublics, pkstr, curve)
}
export function get_rpool_size(curve: string): string {
  if (usingWasm) {
    return wasm_get_rpool_size(curve)
  }
  return MpcWallet.get_rpool_size(curve)
}
export function compute_presig(apiKeyStr: string, msgHashStr: string, curve: string): string {
  if (usingWasm) {
    return wasm_compute_presig(apiKeyStr, msgHashStr, curve)
  }
  return MpcWallet.compute_presig(apiKeyStr, msgHashStr, curve)
}

export const init_api_childkey_creator = wasm_init_api_childkey_creator
export const init_api_childkey_creator_with_verified_paillier = wasm_init_api_childkey_creator_with_verified_paillier
export const verify_paillier = wasm_verify_paillier
export const create_api_childkey = wasm_create_api_childkey
export const verify = wasm_verify
export const publickey_from_secretkey = wasm_publickey_from_secretkey
export const sign = wasm_sign
