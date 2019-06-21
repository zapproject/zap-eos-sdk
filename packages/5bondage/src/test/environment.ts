const path = require('path');
const fs = require('fs');
import { Account, Node, Transaction} from '@zapjs/eos-utils';
import {Deployer} from '@zapjs/eos-node-utils';
import { spawn, execSync } from 'child_process';
const PROJECT_PATH = path.join(__dirname + '/..');
import * as stream from "stream";
import { Binaries } from "@zapjs/eos-binaries";
import { runInThisContext } from 'vm';


//TODO: receive dynamically
const NODEOS_PATH = '/usr/local/bin/nodeos';
const EOS_DIR = '/home/user/eos';

const ACC_TEST_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const ACC_OWNER_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';



function waitEvent(event: stream.Readable, type: string) {
    return new Promise(function(resolve, reject) {
        function listener(data: any) {
            event.removeListener(type, listener);
            resolve(data);
        }

        event.on(type, listener);
    });
}

export class TestNode extends Node {
    private recompile: boolean;
    private running: boolean;
    public provider: Account;
    public user: Account;
    public zap: Account;
    public token: Account;
    private nodeos_path: string;
    private instance: any;

    constructor(verbose: boolean, recompile: boolean, endpoint: string, chain_id: any) {
        super({verbose: verbose, key_provider: ["5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"], http_endpoint: endpoint, chain_id, contract: "zapcoretest1"});
        this.recompile = recompile;
        this.running = false;
        this.instance = null;
        this.nodeos_path = NODEOS_PATH;
        this.provider = new Account('provider');
        this.provider.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.user = new Account('user');
        this.user.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.token = new Account('zap.token');
        this.token.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.zap = this.getZapAccount();
        this.zap.usePrivateKey(ACC_OWNER_PRIV_KEY);
    }
    async run() {
        if (this.instance) {
            throw new Error('Test EOS node is already running.');
        }
        // use spawn function because nodeos has infinity output
        this.instance = spawn('nodeos', ['-e -p eosio', '--delete-all-blocks', '--plugin eosio::producer_plugin', '--plugin eosio::history_plugin', '--plugin eosio::chain_api_plugin', '--plugin eosio::history_api_plugin', '--plugin eosio::http_plugin'], {shell: true, detached: true});
        // wait until node is running

        while (this.running === false) {
            await waitEvent(this.instance.stderr, 'data');
                if (this.running === false) {
                    this.running = true;
                }
        }

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

     async restart() {
        this.kill();
        await this.run();
        if (!this.running) {
            throw new Error('Eos node must running receiver setup initial state.');
        }
    }

    async init() {
        await this.registerAccounts(this.api);
        await this.deploy(this.api);
    }

    async registerAccounts(api: any) {
        const results = [];
        results.push(await this.provider.register(api));
        results.push(await this.zap.register(api));
        results.push(await this.token.register(api));
        results.push(await this.user.register(api))
        return results;
    }

    async deploy(api: any) {
        const results: any = [];
        const deployer = new Deployer({api, contract_name: 'main'});
        deployer.from(this.zap);
        deployer.abi(Binaries.mainAbi);
        deployer.wasm(Binaries.mainWasm);
        results.push(await deployer.deploy());
        let createTokenTransaction = new Transaction()
            .sender(this.token)
            .receiver(this.token)
            .action('create')
            .data({issuer: this.token.name, maximum_supply: "100000000 TST"});

        results.push(
            await new Deployer({api, contract_name: 'zap.token'})
                .from(this.token)
                .abi(Binaries.tokenAbi)
                .wasm(Binaries.tokenWasm)
                .afterDeploy(createTokenTransaction)
                .deploy()
        );
        return results;
    }

    getProvider() {
        return this.provider;
    }
}