
const path = require('path').join(__dirname, 'mpc_wallet_client_bg.wasm');
const bytes = require('fs').readFileSync(path);
let imports = {};
imports['./mpc_wallet_client.js'] = require('./mpc_wallet_client.js');

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
module.exports = wasmInstance.exports;
