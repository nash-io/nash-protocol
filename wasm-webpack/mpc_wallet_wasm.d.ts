/* tslint:disable */
/* eslint-disable */
/**
 * Generate shared random values using Diffie-Hellman
 * Input: n: number of values to generate, curve: Secp256r1 or Secp256k1
 * Output: dh_secrets: list of (n) DH secret values, dh_publics: list of (n) DH public values
 */
export function dh_init(n: number, curve_str: string): string;
/**
 * Initialize API key creation by setting the full secret key
 * Input: secret_key: full secret key
 * Output: API key creation struct
 */
export function init_api_childkey_creator(secret_key_str: string): string;
/**
 * Initialize api key creation by setting the full secret key and the paillier public key.
 * The Paillier public key must have been verified for correctness before!
 * This facilitates fast API key generation, because the correctness of the Paillier public key needs only be checked once.
 * Input: secret_key: full secret key, paillier_pk: Paillier public key
 * Output: api_childkey_creator: API key creation struct
 */
export function init_api_childkey_creator_with_verified_paillier(secret_key_str: string, paillier_pk_str: string): string;
/**
 * Verify that the Paillier public key was generated correctly.
 * Input: api_childkey_creator: API key creation struct, paillier_pk: Paillier public key, correct_key_proof: proof
 * Output: api_childkey_creator: API key creation struct
 */
export function verify_paillier(api_childkey_creator_str: string, paillier_pk_str: string, correct_key_proof_str: string): string;
/**
 * Create API childkey
 * Input: api_childkey_creator: API childkey creation struct, curve: Secp256k1 or Secp256r1 curve
 * Output: api_childkey: API childkey struct
 */
export function create_api_childkey(api_childkey_creator_str: string, curve_str: string): string;
/**
 * Fill pool of random and nonce values to facilitate signature generation with a single message.
 * Input: client_dh_secrets: list of client DH secret values, server_dh_publics: list of server DH public values, curve: Secp256k1 or Secp256r1, paillier_pk: Paillier public key
 * Output: none
 */
export function fill_rpool(client_dh_secrets_str: string, server_dh_publics_str: string, curve_str: string, paillier_pk_str: string): string;
/**
 * Get current size of pool of r-values.
 * Input: curve: Secp256k1 or Secp256r1
 * Output: size of pool
 */
export function get_rpool_size(curve_str: string): string;
/**
 * Compute presignature.
 * Input: api_childkey: API childkey struct, msg_hash: message hash, curve: Secp256k1 or Secp256r1 curve
 * Output: presig: presignature, r: message-independent part of the signature used
 */
export function compute_presig(api_childkey_str: string, msg_hash_str: string, curve_str: string): string;
/**
 * Verify signature.
 * Input: r: r part of the ECDSA signature, s: s part of the ECDSA signature, pubkey: public key, msg_hash: message hash, curve: Secp256k1 or Secp256r1
 * Output: boolean value indicating success
 */
export function verify(r_str: string, s_str: string, pubkey_str: string, msg_hash_str: string, curve_str: string): string;
/**
 * Derive public key from given secret key.
 * Input: secret_key: full secret key, curve: Secp256k1 or Secp256r1 curve
 * Output: public_key
 */
export function publickey_from_secretkey(secret_key_str: string, curve_str: string): string;
/**
 * Generate signature for given message hash under given secret key
 * Input: secret_key: full secret key, msg_hash: message hash
 * Output: (r, s): ECDSA signature
 */
export function sign(secret_key_str: string, msg_hash_str: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly dh_init: (a: number, b: number, c: number, d: number) => void;
  readonly init_api_childkey_creator: (a: number, b: number, c: number) => void;
  readonly init_api_childkey_creator_with_verified_paillier: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly verify_paillier: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly create_api_childkey: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly fill_rpool: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly get_rpool_size: (a: number, b: number, c: number) => void;
  readonly compute_presig: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly verify: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => void;
  readonly publickey_from_secretkey: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly sign: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly rustsecp256k1_v0_2_0_default_illegal_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_2_0_default_error_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_2_0_context_create: (a: number) => number;
  readonly rustsecp256k1_v0_2_0_context_destroy: (a: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
