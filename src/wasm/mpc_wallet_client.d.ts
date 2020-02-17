/* tslint:disable */
/**
* @param {number} n 
* @param {string} curve_str 
* @returns {string} 
*/
export function dh_init(n: number, curve_str: string): string;
/**
* @param {string} secret_key_str 
* @returns {string} 
*/
export function init_api_childkey_creator(secret_key_str: string): string;
/**
* @param {string} secret_key_str 
* @param {string} paillier_pk_str 
* @returns {string} 
*/
export function init_api_childkey_creator_with_verified_paillier(secret_key_str: string, paillier_pk_str: string): string;
/**
* @param {string} api_childkey_creator_str 
* @param {string} paillier_pk_str 
* @param {string} correct_key_proof_str 
* @returns {string} 
*/
export function verify_paillier(api_childkey_creator_str: string, paillier_pk_str: string, correct_key_proof_str: string): string;
/**
* @param {string} api_childkey_creator_str 
* @param {string} curve_str 
* @returns {string} 
*/
export function create_api_childkey(api_childkey_creator_str: string, curve_str: string): string;
/**
* @param {string} client_dh_secrets_str 
* @param {string} server_dh_publics_str 
* @param {string} curve_str 
* @returns {string} 
*/
export function fill_rpool(client_dh_secrets_str: string, server_dh_publics_str: string, curve_str: string): string;
/**
* @param {string} curve_str 
* @returns {string} 
*/
export function get_rpool_size(curve_str: string): string;
/**
* @param {string} api_childkey_str 
* @param {string} msg_hash_str 
* @param {string} curve_str 
* @returns {string} 
*/
export function compute_presig(api_childkey_str: string, msg_hash_str: string, curve_str: string): string;
/**
* @param {string} r_str 
* @param {string} s_str 
* @param {string} pubkey_str 
* @param {string} msg_hash_str 
* @param {string} curve_str 
* @returns {string} 
*/
export function verify(r_str: string, s_str: string, pubkey_str: string, msg_hash_str: string, curve_str: string): string;
/**
* @param {string} secret_key_str 
* @param {string} curve_str 
* @returns {string} 
*/
export function publickey_from_secretkey(secret_key_str: string, curve_str: string): string;
