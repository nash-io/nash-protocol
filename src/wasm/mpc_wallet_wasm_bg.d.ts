/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory
export function rustsecp256k1_v0_1_1_context_preallocated_size(a: number): number
export function rustsecp256k1_v0_1_1_context_preallocated_create(a: number, b: number): number
export function rustsecp256k1_v0_1_1_context_preallocated_destroy(a: number): void
export function rustsecp256k1_v0_1_1_ec_pubkey_parse(a: number, b: number, c: number, d: number): number
export function rustsecp256k1_v0_1_1_ec_pubkey_tweak_mul(a: number, b: number, c: number): number
export function rustsecp256k1_v0_1_1_ec_seckey_verify(a: number, b: number): number
export function rustsecp256k1_v0_1_1_ec_pubkey_serialize(a: number, b: number, c: number, d: number, e: number): number
export function dh_init(a: number, b: number, c: number, d: number): void
export function init_api_childkey_creator(a: number, b: number, c: number): void
export function init_api_childkey_creator_with_verified_paillier(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number
): void
export function verify_paillier(a: number, b: number, c: number, d: number, e: number, f: number, g: number): void
export function create_api_childkey(a: number, b: number, c: number, d: number, e: number): void
export function fill_rpool(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number
): void
export function get_rpool_size(a: number, b: number, c: number): void
export function compute_presig(a: number, b: number, c: number, d: number, e: number, f: number, g: number): void
export function verify(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number
): void
export function rustsecp256k1_v0_1_1_ec_pubkey_combine(a: number, b: number, c: number, d: number): number
export function publickey_from_secretkey(a: number, b: number, c: number, d: number, e: number): void
export function sign(a: number, b: number, c: number, d: number, e: number): void
export function rustsecp256k1_v0_1_1_ecdsa_sign(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
): number
export function rustsecp256k1_v0_1_1_ecdsa_signature_serialize_compact(a: number, b: number, c: number): number
export function rustsecp256k1_v0_1_1_context_create(a: number): number
export function rustsecp256k1_v0_1_1_context_destroy(a: number): void
export function rustsecp256k1_v0_1_1_default_illegal_callback_fn(a: number, b: number): void
export function rustsecp256k1_v0_1_1_default_error_callback_fn(a: number, b: number): void
export function rustsecp256k1_v0_1_1_context_preallocated_clone_size(a: number): number
export function rustsecp256k1_v0_1_1_context_preallocated_clone(a: number, b: number): number
export function rustsecp256k1_v0_1_1_context_set_illegal_callback(a: number, b: number, c: number): void
export function rustsecp256k1_v0_1_1_context_set_error_callback(a: number, b: number, c: number): void
export function rustsecp256k1_v0_1_1_ecdsa_signature_parse_der(a: number, b: number, c: number, d: number): number
export function rustsecp256k1_v0_1_1_ecdsa_signature_parse_compact(a: number, b: number, c: number): number
export function rustsecp256k1_v0_1_1_ecdsa_signature_serialize_der(a: number, b: number, c: number, d: number): number
export function rustsecp256k1_v0_1_1_ecdsa_signature_normalize(a: number, b: number, c: number): number
export function rustsecp256k1_v0_1_1_ecdsa_verify(a: number, b: number, c: number, d: number): number
export function rustsecp256k1_v0_1_1_ec_pubkey_create(a: number, b: number, c: number): number
export function rustsecp256k1_v0_1_1_ec_privkey_negate(a: number, b: number): number
export function rustsecp256k1_v0_1_1_ec_pubkey_negate(a: number, b: number): number
export function rustsecp256k1_v0_1_1_ec_privkey_tweak_add(a: number, b: number, c: number): number
export function rustsecp256k1_v0_1_1_ec_pubkey_tweak_add(a: number, b: number, c: number): number
export function rustsecp256k1_v0_1_1_ec_privkey_tweak_mul(a: number, b: number, c: number): number
export function rustsecp256k1_v0_1_1_context_randomize(a: number, b: number): number
export function rustsecp256k1_v0_1_1_ecdh(a: number, b: number, c: number, d: number, e: number, f: number): number
export function __wbindgen_malloc(a: number): number
export function __wbindgen_realloc(a: number, b: number, c: number): number
export function __wbindgen_free(a: number, b: number): void
