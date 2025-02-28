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
