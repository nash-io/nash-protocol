/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const dh_init: (a: number, b: number, c: number) => [number, number];
export const init_api_childkey_creator: (a: number, b: number) => [number, number];
export const init_api_childkey_creator_with_verified_paillier: (a: number, b: number, c: number, d: number) => [number, number];
export const verify_paillier: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
export const create_api_childkey: (a: number, b: number, c: number, d: number) => [number, number];
export const fill_rpool: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
export const get_rpool_size: (a: number, b: number) => [number, number];
export const compute_presig: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
export const verify: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number];
export const publickey_from_secretkey: (a: number, b: number, c: number, d: number) => [number, number];
export const sign: (a: number, b: number, c: number, d: number) => [number, number];
export const rustsecp256k1_v0_2_0_context_create: (a: number) => number;
export const rustsecp256k1_v0_2_0_context_destroy: (a: number) => void;
export const rustsecp256k1_v0_2_0_default_illegal_callback_fn: (a: number, b: number) => void;
export const rustsecp256k1_v0_2_0_default_error_callback_fn: (a: number, b: number) => void;
export const __wbindgen_export_0: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_start: () => void;
