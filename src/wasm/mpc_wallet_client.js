let wasm;
const { TextDecoder } = require(String.raw`util`);

let cachegetInt32Memory = null;
function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}
/**
* @param {number} n
* @returns {string}
*/
module.exports.dh_init = function(n) {
    const retptr = 8;
    const ret = wasm.dh_init(retptr, n);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
};

let WASM_VECTOR_LEN = 0;

let cachegetNodeBufferMemory = null;
function getNodeBufferMemory() {
    if (cachegetNodeBufferMemory === null || cachegetNodeBufferMemory.buffer !== wasm.memory.buffer) {
        cachegetNodeBufferMemory = Buffer.from(wasm.memory.buffer);
    }
    return cachegetNodeBufferMemory;
}

function passStringToWasm(arg) {

    const len = Buffer.byteLength(arg);
    const ptr = wasm.__wbindgen_malloc(len);
    getNodeBufferMemory().write(arg, ptr, len);
    WASM_VECTOR_LEN = len;
    return ptr;
}
/**
* @param {string} secret_key_str
* @returns {string}
*/
module.exports.init_apikeycreator = function(secret_key_str) {
    const retptr = 8;
    const ret = wasm.init_apikeycreator(retptr, passStringToWasm(secret_key_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
};

/**
* @param {string} secret_key_str
* @param {string} paillier_pk_str
* @returns {string}
*/
module.exports.init_apikeycreator_with_verified_paillier = function(secret_key_str, paillier_pk_str) {
    const retptr = 8;
    const ret = wasm.init_apikeycreator_with_verified_paillier(retptr, passStringToWasm(secret_key_str), WASM_VECTOR_LEN, passStringToWasm(paillier_pk_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
};

/**
* @param {string} apikeycreator_str
* @param {string} paillier_pk_str
* @param {string} correct_key_proof_str
* @returns {string}
*/
module.exports.verify_paillier = function(apikeycreator_str, paillier_pk_str, correct_key_proof_str) {
    const retptr = 8;
    const ret = wasm.verify_paillier(retptr, passStringToWasm(apikeycreator_str), WASM_VECTOR_LEN, passStringToWasm(paillier_pk_str), WASM_VECTOR_LEN, passStringToWasm(correct_key_proof_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
};

/**
* @param {string} apikeycreator_str
* @returns {string}
*/
module.exports.create_api_key = function(apikeycreator_str) {
    const retptr = 8;
    const ret = wasm.create_api_key(retptr, passStringToWasm(apikeycreator_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
};

/**
* @param {string} client_dh_secrets_str
* @param {string} server_dh_publics_str
* @returns {string}
*/
module.exports.fill_rpool = function(client_dh_secrets_str, server_dh_publics_str) {
    const retptr = 8;
    const ret = wasm.fill_rpool(retptr, passStringToWasm(client_dh_secrets_str), WASM_VECTOR_LEN, passStringToWasm(server_dh_publics_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
};

/**
* @returns {string}
*/
module.exports.get_rpool_size = function() {
    const retptr = 8;
    const ret = wasm.get_rpool_size(retptr);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
};

/**
* @param {string} api_key_str
* @param {string} msg_hash_str
* @returns {string}
*/
module.exports.compute_presig = function(api_key_str, msg_hash_str) {
    const retptr = 8;
    const ret = wasm.compute_presig(retptr, passStringToWasm(api_key_str), WASM_VECTOR_LEN, passStringToWasm(msg_hash_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
};

/**
* @param {string} r_str
* @param {string} s_str
* @param {string} pubkey_str
* @param {string} msg_hash_str
* @returns {string}
*/
module.exports.verify = function(r_str, s_str, pubkey_str, msg_hash_str) {
    const retptr = 8;
    const ret = wasm.verify(retptr, passStringToWasm(r_str), WASM_VECTOR_LEN, passStringToWasm(s_str), WASM_VECTOR_LEN, passStringToWasm(pubkey_str), WASM_VECTOR_LEN, passStringToWasm(msg_hash_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
};

/**
* @param {string} secret_key_str
* @returns {string}
*/
module.exports.publickey_from_secretkey = function(secret_key_str) {
    const retptr = 8;
    const ret = wasm.publickey_from_secretkey(retptr, passStringToWasm(secret_key_str), WASM_VECTOR_LEN);
    const memi32 = getInt32Memory();
    const v0 = getStringFromWasm(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1]).slice();
    wasm.__wbindgen_free(memi32[retptr / 4 + 0], memi32[retptr / 4 + 1] * 1);
    return v0;
};

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

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbg_new_3a746f2619705add = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_call_f54d3a6dadb199ca = function(arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
};

module.exports.__wbindgen_jsval_eq = function(arg0, arg1) {
    const ret = getObject(arg0) === getObject(arg1);
    return ret;
};

module.exports.__wbg_self_ac379e780a0d8b94 = function(arg0) {
    const ret = getObject(arg0).self;
    return addHeapObject(ret);
};

module.exports.__wbg_crypto_1e4302b85d4f64a2 = function(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_undefined = function(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

module.exports.__wbg_getRandomValues_1b4ba144162a5c9e = function(arg0) {
    const ret = getObject(arg0).getRandomValues;
    return addHeapObject(ret);
};

module.exports.__wbg_require_6461b1e9a0d7c34a = function(arg0, arg1) {
    const ret = require(getStringFromWasm(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_randomFillSync_1b52c8482374c55b = function(arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm(arg1, arg2));
};

module.exports.__wbg_getRandomValues_1ef11e888e5228e9 = function(arg0, arg1, arg2) {
    getObject(arg0).getRandomValues(getArrayU8FromWasm(arg1, arg2));
};
wasm = require('./mpc_wallet_client_bg');

