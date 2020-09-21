import os from 'os'

interface NodeFileInterface {
  dh_init: (size: number, curve: string) => string
  fill_rpool: (clientDHSecrets: string, serverDHPublics: string, curve: string, pkstr: string) => string
  get_rpool_size: (curve: string) => string
  compute_presig: (apiKeyStr: string, msgHashStr: string, curve: string) => string
  sign: (secretkey: string, hash: string) => string
}

const loadNodeFile = (): NodeFileInterface => {
  const platform = os.platform()

  switch (platform) {
    // case 'aix':
    // case 'android':
    // case 'freebsd':
    // case 'openbsd':
    // case 'sunos':
    // case 'netbsd':
    case 'linux':
      return require('./linux_debug_index.node')
    case 'darwin':
      return require('./osx_index.node')
    case 'win32':
    case 'cygwin':
      return require('./win_index.node')
    default:
      throw new Error(`Platform ${platform}`)
  }
}

const MpcWallet = loadNodeFile()
export function dh_init(size: number, curve: string): string {
  return MpcWallet.dh_init(size, JSON.parse(curve))
}
export function fill_rpool(clientDHSecrets: string, serverDHPublics: string, curve: string, pkstr: string): string {
  return MpcWallet.fill_rpool(clientDHSecrets, serverDHPublics, JSON.parse(curve), pkstr)
}
export function get_rpool_size(curve: string): string {
  return MpcWallet.get_rpool_size(JSON.parse(curve))
}
export function compute_presig(apiKeyStr: string, msgHashStr: string, curve: string): string {
  return MpcWallet.compute_presig(apiKeyStr, msgHashStr, JSON.parse(curve))
}

export function init_api_childkey_creator(_: string): string {
  throw new Error('unsupported')
}
export function init_api_childkey_creator_with_verified_paillier(_: string, __: string): string {
  throw new Error('unsupported')
}
export function verify_paillier(_: string, __: string, ___: string): string {
  throw new Error('unsupported')
}
export function create_api_childkey(_: string, __: string): string {
  throw new Error('unsupported')
}
export function verify(_: string, __: string, ___: string, ____: string, _____: string): string {
  throw new Error('unsupported')
}
export function publickey_from_secretkey(_: string, __: string): string {
  throw new Error('unsupported')
}
export function sign(_: string, __: string): string {
  throw new Error('unsupported')
}
