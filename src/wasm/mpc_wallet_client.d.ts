/* tslint:disable */
/**
* @param {number} n 
* @returns {string} 
*/
export function dh_init(n: number): string;
/**
* @param {string} secret_key_str 
* @returns {string} 
*/
export function init_apikeycreator(secret_key_str: string): string;
/**
* @param {string} secret_key_str 
* @param {string} paillier_pk_str 
* @returns {string} 
*/
export function init_apikeycreator_with_verified_paillier(secret_key_str: string, paillier_pk_str: string): string;
/**
* @param {string} apikeycreator_str 
* @param {string} paillier_pk_str 
* @param {string} correct_key_proof_str 
* @returns {string} 
*/
export function verify_paillier(apikeycreator_str: string, paillier_pk_str: string, correct_key_proof_str: string): string;
/**
* @param {string} apikeycreator_str 
* @returns {string} 
*/
export function create_api_key(apikeycreator_str: string): string;
/**
* @param {string} client_dh_secrets_str 
* @param {string} server_dh_publics_str 
* @returns {string} 
*/
export function fill_rpool(client_dh_secrets_str: string, server_dh_publics_str: string): string;
/**
* @returns {string} 
*/
export function get_rpool_size(): string;
/**
* @param {string} api_key_str 
* @param {string} msg_hash_str 
* @returns {string} 
*/
export function compute_presig(api_key_str: string, msg_hash_str: string): string;
/**
* @param {string} signature_str 
* @param {string} pubkey_str 
* @param {string} msg_hash_str 
* @returns {string} 
*/
export function verify(signature_str: string, pubkey_str: string, msg_hash_str: string): string;
/**
* @param {string} secret_key_str 
* @returns {string} 
*/
export function publickey_from_secretkey(secret_key_str: string): string;
