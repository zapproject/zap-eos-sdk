const fs = require('fs');
const path = require('path');

export class Binaries {
    static tokenAbi = fs.readFileSync(path.resolve(__dirname, 'bin', 'eosio.token.abi'));
    static tokenWasm = fs.readFileSync(path.resolve(__dirname, 'bin', 'eosio.token.wasm'));
    static mainAbi = fs.readFileSync(path.resolve(__dirname, 'bin', 'main.abi'));
    static mainWasm = fs.readFileSync(path.resolve(__dirname, 'bin', 'main.wasm'));
}