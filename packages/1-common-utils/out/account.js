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
const eos_ecc = require('eosjs-ecc');
class Account {
    constructor(account_name) {
        this.public_key = '';
        this._name = account_name;
        this._default_auth = 'active';
        this.isAccount = true;
    }
    usePrivateKey(private_key) {
        if (!eos_ecc.isValidPrivate(private_key)) {
            throw new Error("Private key is invalid.");
        }
        this.public_key = eos_ecc.privateToPublic(private_key);
        return this;
    }
    setPublicKey(key) {
        this.public_key = key;
    }
    register(api) {
        return __awaiter(this, void 0, void 0, function* () {
            yield api.transact({
                actions: [{
                        account: 'eosio',
                        name: 'newaccount',
                        authorization: [{
                                actor: 'eosio',
                                permission: 'active'
                            }],
                        data: {
                            creator: 'eosio',
                            name: this.name,
                            owner: {
                                threshold: 1,
                                keys: [{
                                        key: this.public_key,
                                        weight: 1
                                    }],
                                accounts: [],
                                waits: []
                            },
                            active: {
                                threshold: 1,
                                keys: [{
                                        key: this.public_key,
                                        weight: 1
                                    }],
                                accounts: [],
                                waits: []
                            },
                        },
                    },
                ]
            }, {
                blocksBehind: 3,
                expireSeconds: 60,
            });
        });
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get default_auth() {
        return this._default_auth;
    }
    set default_auth(value) {
        this._default_auth = value;
    }
}
exports.Account = Account;
