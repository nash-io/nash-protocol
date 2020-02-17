import * as wasm from './mpc_wallet_client_bg.wasm';

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function passStringToWasm(arg) {

    let len = arg.length;
    let ptr = wasm.__wbindgen_malloc(len);

    const mem = getUint8Memory();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = wasm.__wbindgen_realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory = null;
function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}
/**
* @param {number} n
* @param {string} curve_str
* @returns {string}
*/
export function dh_init(n, curve_str) {
    const retptr = 8;
    const ret = wasm.dh_init(retptr, n, passStringToWasm(curve_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
}

/**
* @param {string} secret_key_str
* @returns {string}
*/
export function init_api_childkey_creator(secret_key_str) {
    const retptr = 8;
    const ret = wasm.init_api_childkey_creator(retptr, passStringToWasm(secret_key_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
}

/**
* @param {string} secret_key_str
* @param {string} paillier_pk_str
* @returns {string}
*/
export function init_api_childkey_creator_with_verified_paillier(secret_key_str, paillier_pk_str) {
    const retptr = 8;
    const ret = wasm.init_api_childkey_creator_with_verified_paillier(retptr, passStringToWasm(secret_key_str), WASM_VECTOR_LEN, passStringToWasm(paillier_pk_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
}

/**
* @param {string} api_childkey_creator_str
* @param {string} paillier_pk_str
* @param {string} correct_key_proof_str
* @returns {string}
*/
export function verify_paillier(api_childkey_creator_str, paillier_pk_str, correct_key_proof_str) {
    const retptr = 8;
    const ret = wasm.verify_paillier(retptr, passStringToWasm(api_childkey_creator_str), WASM_VECTOR_LEN, passStringToWasm(paillier_pk_str), WASM_VECTOR_LEN, passStringToWasm(correct_key_proof_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
}

/**
* @param {string} api_childkey_creator_str
* @param {string} curve_str
* @returns {string}
*/
export function create_api_childkey(api_childkey_creator_str, curve_str) {
    const retptr = 8;
    const ret = wasm.create_api_childkey(retptr, passStringToWasm(api_childkey_creator_str), WASM_VECTOR_LEN, passStringToWasm(curve_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
}

/**
* @param {string} client_dh_secrets_str
* @param {string} server_dh_publics_str
* @param {string} curve_str
* @returns {string}
*/
export function fill_rpool(client_dh_secrets_str, server_dh_publics_str, curve_str) {
    const retptr = 8;
    const ret = wasm.fill_rpool(retptr, passStringToWasm(client_dh_secrets_str), WASM_VECTOR_LEN, passStringToWasm(server_dh_publics_str), WASM_VECTOR_LEN, passStringToWasm(curve_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
}

/**
* @param {string} curve_str
* @returns {string}
*/
export function get_rpool_size(curve_str) {
    const retptr = 8;
    const ret = wasm.get_rpool_size(retptr, passStringToWasm(curve_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
}

/**
* @param {string} api_childkey_str
* @param {string} msg_hash_str
* @param {string} curve_str
* @returns {string}
*/
export function compute_presig(api_childkey_str, msg_hash_str, curve_str) {
    const retptr = 8;
    const ret = wasm.compute_presig(retptr, passStringToWasm(api_childkey_str), WASM_VECTOR_LEN, passStringToWasm(msg_hash_str), WASM_VECTOR_LEN, passStringToWasm(curve_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
}

/**
* @param {string} r_str
* @param {string} s_str
* @param {string} pubkey_str
* @param {string} msg_hash_str
* @param {string} curve_str
* @returns {string}
*/
export function verify(r_str, s_str, pubkey_str, msg_hash_str, curve_str) {
    const retptr = 8;
    const ret = wasm.verify(retptr, passStringToWasm(r_str), WASM_VECTOR_LEN, passStringToWasm(s_str), WASM_VECTOR_LEN, passStringToWasm(pubkey_str), WASM_VECTOR_LEN, passStringToWasm(msg_hash_str), WASM_VECTOR_LEN, passStringToWasm(curve_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
}

/**
* @param {string} secret_key_str
* @param {string} curve_str
* @returns {string}
*/
export function publickey_from_secretkey(secret_key_str, curve_str) {
    const retptr = 8;
    const ret = wasm.publickey_from_secretkey(retptr, passStringToWasm(secret_key_str), WASM_VECTOR_LEN, passStringToWasm(curve_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
}

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getArrayU8FromWasm(ptr, len) {
    return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
}

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbg_new_3a746f2619705add = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm(arg0, arg1));
    return addHeapObject(ret);
};

export const __wbg_call_f54d3a6dadb199ca = function(arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
};

export const __wbindgen_jsval_eq = function(arg0, arg1) {
    const ret = getObject(arg0) === getObject(arg1);
    return ret;
};

export const __wbg_self_ac379e780a0d8b94 = function(arg0) {
    const ret = getObject(arg0).self;
    return addHeapObject(ret);
};

export const __wbg_crypto_1e4302b85d4f64a2 = function(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export const __wbindgen_is_undefined = function(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export const __wbg_getRandomValues_1b4ba144162a5c9e = function(arg0) {
    const ret = getObject(arg0).getRandomValues;
    return addHeapObject(ret);
};

export const __wbg_require_6461b1e9a0d7c34a = function(arg0, arg1) {
    const ret = require(getStringFromWasm(arg0, arg1));
    return addHeapObject(ret);
};

export const __wbg_randomFillSync_1b52c8482374c55b = function(arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm(arg1, arg2));
};

export const __wbg_getRandomValues_1ef11e888e5228e9 = function(arg0, arg1, arg2) {
    getObject(arg0).getRandomValues(getArrayU8FromWasm(arg1, arg2));
};

