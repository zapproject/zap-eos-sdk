"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = __importStar(require("@zapjs/eos-utils"));
const eos_bondage_1 = require("@zapjs/eos-bondage");
const eos_arbiter_1 = require("@zapjs/eos-arbiter");
const eos_dispatch_1 = require("@zapjs/eos-dispatch");
const eos_tokendotfactory_1 = require("@zapjs/eos-tokendotfactory");
class Subscriber {
    constructor({ account, node }) {
        this._account = account;
        this._node = node;
        this._zap_account = node.getZapAccount();
        this.bondage = new eos_bondage_1.Bondage({
            account: this._account,
            node
        });
        this.arbiter = new eos_arbiter_1.Arbiter({
            account: this._account,
            node
        });
        this.dispatch = new eos_dispatch_1.Dispatch({
            account: this._account,
            node
        });
        this.tokenDotFactory = new eos_tokendotfactory_1.TokenDotFactory({
            //@ts-ignore
            account: this._account,
            //@ts-ignore
            node
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.connect();
        });
    }
    getAccount() {
        return this._account;
    }
    getNode() {
        return this._node;
    }
    bond(provider, endpoint, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.bondage.bond(provider, endpoint, amount);
        });
    }
    unbond(provider, endpoint, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.bondage.unbond(provider, endpoint, amount);
        });
    }
    queryHolders(from, to, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.bondage.queryHolders(from, to, limit);
        });
    }
    buyRamBytes(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Utils.Transaction()
                .sender(this._account)
                //@ts-ignore
                .receiver(new Utils.Account('eosio'))
                .action('buyrambytes')
                .data({
                payer: this._account.name,
                receiver: this._account.name,
                bytes: amount
            })
                .execute(this._node.api);
        });
    }
    delegateBw(net, cpu, receiver = this._account.name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Utils.Transaction()
                .sender(this._account)
                //@ts-ignore
                .receiver(new Utils.Account('eosio'))
                .action('delegatebw')
                .data({
                from: this._account.name,
                receiver: receiver,
                stake_net_quantity: net,
                stake_cpu_quantity: cpu,
                transfer: false,
            })
                .execute(this._node.api);
        });
    }
    unDelegateBw(net, cpu, receiver = this._account.name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Utils.Transaction()
                .sender(this._account)
                //@ts-ignore
                .receiver(new Utils.Account('eosio'))
                .action('undelegatebw')
                .data({
                from: this._account.name,
                receiver: receiver,
                unstake_net_quantity: net,
                unstake_cpu_quantity: cpu,
                transfer: false,
            })
                .execute(this._node.api);
        });
    }
    handlePermission(contract, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this._node.rpc.get_account(this._account.name);
            const { accounts, keys, waits } = JSON.parse(JSON.stringify(account.permissions)).filter((x) => x.perm_name === 'active')[0].required_auth;
            if (type !== 'add' && type !== 'remove')
                return;
            if (type === 'add' && accounts.filter((x) => x.permission.actor == contract).length)
                return;
            const newPermission = [{
                    "permission": {
                        "actor": contract,
                        "permission": "eosio.code"
                    },
                    "weight": 1
                }];
            const newKeys = keys.length ? keys : [
                {
                    "key": (yield this._node.api.signatureProvider.getAvailableKeys())[0],
                    "weight": 1
                }
            ];
            const data = {
                'account': this._account.name,
                'permission': 'active',
                'parent': 'owner',
                "auth": {
                    "threshold": 1,
                    "keys": newKeys,
                    "accounts": type === 'add' ? accounts.concat(newPermission) : accounts.filter((x) => x.permission.actor !== contract),
                    "waits": waits
                }
            };
            return yield new Utils.Transaction()
                .sender(this._account, 'owner')
                .receiver(new Utils.Account('eosio'))
                .action('updateauth')
                .data(data)
                .execute(this._node.api);
        });
    }
    subscribe(provider, endpoint, dots, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.arbiter.subscribe(provider, endpoint, dots, params);
        });
    }
    unsubscribe(provider, endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.arbiter.unsubscribeSubscriber(provider, endpoint);
        });
    }
    query(provider, endpoint, query, onchain_provider, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.dispatch.query(provider, endpoint, query, onchain_provider, timestamp);
        });
    }
    cancelQuery(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.dispatch.cancelQuery(id);
        });
    }
    tokenBond(provider, specifier, dots) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tokenDotFactory.tokenBond(provider, specifier, dots);
        });
    }
    tokenUnBond(provider, specifier, dots) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tokenDotFactory.tokenUnBond(provider, specifier, dots);
        });
    }
    getSubscriberTokens(lower_bound, upper_bound, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tokenDotFactory.getSubscriberTokens(lower_bound, upper_bound, limit);
        });
    }
}
exports.Subscriber = Subscriber;
