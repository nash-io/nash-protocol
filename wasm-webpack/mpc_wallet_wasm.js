import * as wasm from "./mpc_wallet_wasm_bg.wasm";
export * from "./mpc_wallet_wasm_bg.js";
import { __wbg_set_wasm } from "./mpc_wallet_wasm_bg.js";
__wbg_set_wasm(wasm);