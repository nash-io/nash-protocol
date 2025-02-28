
let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(`util`);

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

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

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

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
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}
/**
 * Generate shared random values using Diffie-Hellman
 * Input: n: number of values to generate, curve: Secp256r1 or Secp256k1
 * Output: dh_secrets: list of (n) DH secret values, dh_publics: list of (n) DH public values
 * @param {number} n
 * @param {string} curve_str
 * @returns {string}
 */
module.exports.dh_init = function(n, curve_str) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(curve_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.dh_init(n, ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
};

/**
 * Initialize API key creation by setting the full secret key
 * Input: secret_key: full secret key
 * Output: API key creation struct
 * @param {string} secret_key_str
 * @returns {string}
 */
module.exports.init_api_childkey_creator = function(secret_key_str) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(secret_key_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.init_api_childkey_creator(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
};

/**
 * Initialize api key creation by setting the full secret key and the paillier public key.
 * The Paillier public key must have been verified for correctness before!
 * This facilitates fast API key generation, because the correctness of the Paillier public key needs only be checked once.
 * Input: secret_key: full secret key, paillier_pk: Paillier public key
 * Output: api_childkey_creator: API key creation struct
 * @param {string} secret_key_str
 * @param {string} paillier_pk_str
 * @returns {string}
 */
module.exports.init_api_childkey_creator_with_verified_paillier = function(secret_key_str, paillier_pk_str) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(secret_key_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(paillier_pk_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.init_api_childkey_creator_with_verified_paillier(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * Verify that the Paillier public key was generated correctly.
 * Input: api_childkey_creator: API key creation struct, paillier_pk: Paillier public key, correct_key_proof: proof
 * Output: api_childkey_creator: API key creation struct
 * @param {string} api_childkey_creator_str
 * @param {string} paillier_pk_str
 * @param {string} correct_key_proof_str
 * @returns {string}
 */
module.exports.verify_paillier = function(api_childkey_creator_str, paillier_pk_str, correct_key_proof_str) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(api_childkey_creator_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(paillier_pk_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(correct_key_proof_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.verify_paillier(ptr0, len0, ptr1, len1, ptr2, len2);
        deferred4_0 = ret[0];
        deferred4_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
};

/**
 * Create API childkey
 * Input: api_childkey_creator: API childkey creation struct, curve: Secp256k1 or Secp256r1 curve
 * Output: api_childkey: API childkey struct
 * @param {string} api_childkey_creator_str
 * @param {string} curve_str
 * @returns {string}
 */
module.exports.create_api_childkey = function(api_childkey_creator_str, curve_str) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(api_childkey_creator_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(curve_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.create_api_childkey(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * Fill pool of random and nonce values to facilitate signature generation with a single message.
 * Input: client_dh_secrets: list of client DH secret values, server_dh_publics: list of server DH public values, curve: Secp256k1 or Secp256r1, paillier_pk: Paillier public key
 * Output: none
 * @param {string} client_dh_secrets_str
 * @param {string} server_dh_publics_str
 * @param {string} curve_str
 * @param {string} paillier_pk_str
 * @returns {string}
 */
module.exports.fill_rpool = function(client_dh_secrets_str, server_dh_publics_str, curve_str, paillier_pk_str) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(client_dh_secrets_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(server_dh_publics_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(curve_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(paillier_pk_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.fill_rpool(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        deferred5_0 = ret[0];
        deferred5_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
    }
};

/**
 * Get current size of pool of r-values.
 * Input: curve: Secp256k1 or Secp256r1
 * Output: size of pool
 * @param {string} curve_str
 * @returns {string}
 */
module.exports.get_rpool_size = function(curve_str) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(curve_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.get_rpool_size(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
};

/**
 * Compute presignature.
 * Input: api_childkey: API childkey struct, msg_hash: message hash, curve: Secp256k1 or Secp256r1 curve
 * Output: presig: presignature, r: message-independent part of the signature used
 * @param {string} api_childkey_str
 * @param {string} msg_hash_str
 * @param {string} curve_str
 * @returns {string}
 */
module.exports.compute_presig = function(api_childkey_str, msg_hash_str, curve_str) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(api_childkey_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(msg_hash_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(curve_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.compute_presig(ptr0, len0, ptr1, len1, ptr2, len2);
        deferred4_0 = ret[0];
        deferred4_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
};

/**
 * Verify signature.
 * Input: r: r part of the ECDSA signature, s: s part of the ECDSA signature, pubkey: public key, msg_hash: message hash, curve: Secp256k1 or Secp256r1
 * Output: boolean value indicating success
 * @param {string} r_str
 * @param {string} s_str
 * @param {string} pubkey_str
 * @param {string} msg_hash_str
 * @param {string} curve_str
 * @returns {string}
 */
module.exports.verify = function(r_str, s_str, pubkey_str, msg_hash_str, curve_str) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passStringToWasm0(r_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(s_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(pubkey_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(msg_hash_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(curve_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ret = wasm.verify(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
        deferred6_0 = ret[0];
        deferred6_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
    }
};

/**
 * Derive public key from given secret key.
 * Input: secret_key: full secret key, curve: Secp256k1 or Secp256r1 curve
 * Output: public_key
 * @param {string} secret_key_str
 * @param {string} curve_str
 * @returns {string}
 */
module.exports.publickey_from_secretkey = function(secret_key_str, curve_str) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(secret_key_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(curve_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.publickey_from_secretkey(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

/**
 * Generate signature for given message hash under given secret key
 * Input: secret_key: full secret key, msg_hash: message hash
 * Output: (r, s): ECDSA signature
 * @param {string} secret_key_str
 * @param {string} msg_hash_str
 * @returns {string}
 */
module.exports.sign = function(secret_key_str, msg_hash_str) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(secret_key_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(msg_hash_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.sign(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

module.exports.__wbg_getTime_46267b1c24877e30 = function(arg0) {
    const ret = arg0.getTime();
    return ret;
};

module.exports.__wbg_new0_f788a2397c7ca929 = function() {
    const ret = new Date();
    return ret;
};

module.exports.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_export_0;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

const path = require('path').join(__dirname, 'mpc_wallet_wasm_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

wasm.__wbindgen_start();

