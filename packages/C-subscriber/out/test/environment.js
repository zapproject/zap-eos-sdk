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
const path = require('path');
const fs = require('fs');
const eos_utils_1 = require("@zapjs/eos-utils");
const eos_node_utils_1 = require("@zapjs/eos-node-utils");
const child_process_1 = require("child_process");
const PROJECT_PATH = path.join(__dirname + '/..');
const eos_binaries_1 = require("@zapjs/eos-binaries");
//TODO: receive dynamically
const NODEOS_PATH = '/usr/local/bin/nodeos';
const EOS_DIR = '/home/user/eos';
const ACC_TEST_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const ACC_OWNER_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
function waitEvent(event, type) {
    return new Promise(function (resolve, reject) {
        function listener(data) {
            event.removeListener(type, listener);
            resolve(data);
        }
        event.on(type, listener);
    });
}
class TestNode extends eos_utils_1.Node {
    constructor(verbose, recompile, endpoint, chain_id) {
        super({ verbose: verbose, key_provider: ["5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"], http_endpoint: endpoint, chain_id, contract: "zapcoretest1" });
        this.recompile = recompile;
        this.running = false;
        this.instance = null;
        this.nodeos_path = NODEOS_PATH;
        this.provider = new eos_utils_1.Account('provider');
        this.provider.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.user = new eos_utils_1.Account('user');
        this.user.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.token = new eos_utils_1.Account('zap.token');
        this.token.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.zap = this.getZapAccount();
        this.zap.usePrivateKey(ACC_OWNER_PRIV_KEY);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.instance) {
                throw new Error('Test EOS node is already running.');
            }
            // use spawn function because nodeos has infinity output
            this.instance = child_process_1.spawn('nodeos', ['-e -p eosio', '--delete-all-blocks', '--plugin eosio::producer_plugin', '--plugin eosio::history_plugin', '--plugin eosio::chain_api_plugin', '--plugin eosio::history_api_plugin', '--plugin eosio::http_plugin'], { shell: true, detached: true });
            // wait until node is running
            while (this.running === false) {
                yield waitEvent(this.instance.stderr, 'data');
                if (this.running === false) {
                    this.running = true;
                }
            }
        });
    }
    kill() {
        if (this.instance) {
            this.instance.kill();
            //process.kill(-this.instance.pid, "SIGTERM");
            //process.kill(-this.instance.pid, "SIGINT");
            this.instance = null;
            this.running = false;
        }
    }
    restart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.kill();
            yield this.run();
            if (!this.running) {
                throw new Error('Eos node must running receiver setup initial state.');
            }
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.registerAccounts(this.api);
            yield this.deploy(this.api);
        });
    }
    registerAccounts(api) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            console.log(this.zap.name);
            results.push(yield this.provider.register(api));
            results.push(yield this.zap.register(api));
            results.push(yield this.token.register(api));
            results.push(yield this.user.register(api));
            return results;
        });
    }
    getProviderAccount() {
        return this.provider;
    }
    getUserAccount() {
        return this.user;
    }
    deploy(api) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const deployer = new eos_node_utils_1.Deployer({ api, contract_name: 'main' });
            deployer.from(this.zap);
            deployer.abi(eos_binaries_1.Binaries.mainAbi);
            deployer.wasm(eos_binaries_1.Binaries.mainWasm);
            results.push(yield deployer.deploy());
            let createTokenTransaction = new eos_utils_1.Transaction()
                .sender(this.token)
                .receiver(this.token)
                .action('create')
                .data({ issuer: this.token.name, maximum_supply: "100000000 TST" });
            results.push(yield new eos_node_utils_1.Deployer({ api, contract_name: 'zap.token' })
                .from(this.token)
                .abi(eos_binaries_1.Binaries.tokenAbi)
                .wasm(eos_binaries_1.Binaries.tokenWasm)
                .afterDeploy(createTokenTransaction)
                .deploy());
            return results;
        });
    }
    getProvider() {
        return this.provider;
    }
}
exports.TestNode = TestNode;
