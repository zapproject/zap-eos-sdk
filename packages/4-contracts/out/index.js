"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
class Binaries {
}
Binaries.tokenAbi = fs.readFileSync(path.resolve(__dirname, '..', 'bin', 'eosio.token.abi'));
Binaries.tokenWasm = fs.readFileSync(path.resolve(__dirname, '..', 'bin', 'eosio.token.wasm'));
Binaries.mainAbi = fs.readFileSync(path.resolve(__dirname, '..', 'bin', 'main.abi'));
Binaries.mainWasm = fs.readFileSync(path.resolve(__dirname, '..', 'bin', 'main.wasm'));
exports.Binaries = Binaries;
