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
const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const path = require('path');
const fs = require('fs');
const eos_registry_1 = require("@zapjs/eos-registry");
const eos_minting_1 = require("@zapjs/eos-minting");
const __1 = require("../");
const environment_1 = require("./environment");
const Utils = __importStar(require("@zapjs/eos-utils"));
function handlePermission(_account, contract, type, node) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = yield node.rpc.get_account(_account.name);
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
                "key": (yield node.api.signatureProvider.getAvailableKeys())[0],
                "weight": 1
            }
        ];
        const data = {
            'account': _account.name,
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
            .sender(_account, 'owner')
            .receiver(new Utils.Account('eosio'))
            .action('updateauth')
            .data(data)
            .execute(node.api);
    });
}
function configureEnvironment(func) {
    return __awaiter(this, void 0, void 0, function* () {
        yield func();
    });
}
function getRowsByPrimaryKey(eos, node, scope, table_name, table_key) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield eos.getTableRows(true, // json
        node.getZapAccount().name, // code
        scope, // scope
        table_name, // table name
        table_key, // table_key
        0, // lower_bound
        -1, // upper_bound
        10, // limit
        'i64', // key_type
        1 // index position
        );
    });
}
describe('Test', () => {
    let node;
    let registry;
    let bondage;
    let bondageProvider;
    let main;
    let minting;
    before(function (done) {
        this.timeout(30000);
        configureEnvironment(() => __awaiter(this, void 0, void 0, function* () {
            try {
                node = new environment_1.TestNode(false, false, 'http://127.0.0.1:8888', '');
                yield node.restart();
                yield node.connect();
                yield node.init();
                registry = new eos_registry_1.Regsitry({
                    account: node.provider,
                    node
                });
                bondage = new __1.Bondage({
                    account: node.user,
                    node
                });
                bondageProvider = new __1.Bondage({
                    account: node.provider,
                    node
                });
                main = new __1.Bondage({
                    account: node.zap,
                    node
                });
                minting = yield new eos_minting_1.Minting(node.token, node);
            }
            catch (e) {
                console.log(e);
            }
            done();
        }));
    });
    it('#bond()', () => __awaiter(this, void 0, void 0, function* () {
        yield handlePermission(node.user, node.zap.name, 'add', node);
        yield minting.issueTokens([{ id: node.user.name, quantity: '300000 TST' }], 'hi');
        yield registry.initiateProvider('tests', 10);
        yield registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
        yield bondage.bond(node.provider.name, 'endp', 1);
        const issued = yield bondageProvider.queryIssued(0, 1, 1);
        const holders = yield bondage.queryHolders(0, -1, 10);
        yield expect(issued.rows[0].dots).to.be.equal(1);
        yield expect(holders.rows[0].dots).to.be.equal(1);
    }));
    it('#unbond()', () => __awaiter(this, void 0, void 0, function* () {
        yield handlePermission(node.user, node.zap.name, 'add', node);
        yield bondage.unbond(node.provider.name, 'endp', 1);
        const issued = yield bondageProvider.queryIssued(0, 1, 1);
        const holders = yield bondage.queryHolders(0, -1, 10);
        yield expect(issued.rows[0].dots).to.be.equal(0);
        yield expect(holders.rows[0].dots).to.be.equal(0);
    }));
    after(() => {
        node.kill();
    });
});
