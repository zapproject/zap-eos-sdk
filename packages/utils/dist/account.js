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
        this.private_key = '';
        this.public_key = '';
        this._name = account_name;
        this._default_auth = 'active';
        this.isAccount = true;
    }
    usePrivateKey(private_key) {
        if (!eos_ecc.isValidPrivate(private_key)) {
            throw new Error("Private key is invalid.");
        }
        this.private_key = private_key;
        this.public_key = eos_ecc.privateToPublic(this.private_key);
        return this;
    }
    register(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield eos.transaction((tr) => {
                tr.newaccount({
                    creator: 'eosio',
                    name: this.name,
                    owner: this.public_key,
                    active: this.public_key
                });
                tr.buyrambytes({
                    payer: 'eosio',
                    receiver: this.name,
                    bytes: 8192
                });
                tr.delegatebw({
                    from: 'eosio',
                    receiver: this.name,
                    stake_net_quantity: '10.0000 SYS',
                    stake_cpu_quantity: '10.0000 SYS',
                    transfer: 0
                });
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
//# sourceMappingURL=account.js.map