"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const eosjs_1 = require("eosjs");
class Deployer {
    constructor({ api, contract_name }) {
        this._wasm = '';
        this._abi = '';
        this._api = api;
        this._contract_name = contract_name;
    }
    from(account) {
        if (!account.isAccount) {
            throw new Error('Account must be instance of account.js');
        }
        this._deployer_account = account;
        return this;
    }
    abi(abi) {
        this._abi = abi;
        return this;
    }
    wasm(wasm) {
        this._wasm = wasm;
        return this;
    }
    afterDeploy(transaction) {
        if (!transaction.isTransaction) {
            throw new Error('Transaction must be instance of transaction.js');
        }
        this._after_deploy_tr = transaction;
        return this;
    }
    beforeDeploy(transaction) {
        if (!transaction.isTransaction) {
            throw new Error('Transaction must be instance of transaction.js');
        }
        this._before_deploy_tr = transaction;
        return this;
    }
    sleep(timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, timeout);
        });
    }
    deploy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._wasm || !this._abi || !this._deployer_account) {
                throw new Error('Deployer not initialized');
            }
            if (this._before_deploy_tr) {
                yield this._api.transact(this._before_deploy_tr);
            }
            const buffer = new eosjs_1.Serialize.SerialBuffer({
                textEncoder: this._api.textEncoder,
                textDecoder: this._api.textDecoder,
            });
            let abi = JSON.parse(this._abi);
            const abiDefinition = this._api.abiTypes.get(`abi_def`);
            abi = abiDefinition.fields.reduce((acc, { name: fieldName }) => Object.assign(acc, { [fieldName]: acc[fieldName] || [] }), abi);
            abiDefinition.serialize(buffer, abi);
            // Publish contract to the blockchain
            const result = yield this._api.transact({
                actions: [{
                        account: 'eosio',
                        name: 'setcode',
                        authorization: [{
                                actor: this._deployer_account.name,
                                permission: 'active',
                            }],
                        data: {
                            account: this._deployer_account.name,
                            vmtype: 0,
                            vmversion: 0,
                            code: this._wasm
                        },
                    },
                    {
                        account: 'eosio',
                        name: 'setabi',
                        authorization: [{
                                actor: this._deployer_account.name,
                                permission: 'active',
                            }],
                        data: {
                            account: this._deployer_account.name,
                            abi: Buffer.from(buffer.asUint8Array()).toString(`hex`)
                        },
                    }
                ]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            });
            if (this._after_deploy_tr) {
                yield this._after_deploy_tr.execute(this._api);
            }
            return result;
        });
    }
}
exports.Deployer = Deployer;
