const path = require('path');
const fs = require('fs');
import {Account, Node, Transaction} from '@zapjs/eos-utils';
import {Deployer} from '@zapjs/eos-node-utils';
import {spawn, execSync} from 'child_process';

const PROJECT_PATH = path.join(__dirname + '/..');
import * as stream from "stream";

import { Binaries } from "@zapjs/eos-binaries";


//TODO: receive dynamically
const NODEOS_PATH = '/usr/local/bin/nodeos';
const EOS_DIR = '/home/user/eos';

const ACC_TEST_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const ACC_OWNER_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';


function waitEvent(event: stream.Readable, type: string) {
    return new Promise(function (resolve, reject) {
        function listener(data: any) {
            event.removeListener(type, listener);
            resolve(data);
        }

        event.on(type, listener);
    });
}

function findElement(array: Array<any>, field: string, value: any) {
    for (let i in array) {
        if (array.hasOwnProperty(i)) {
            if (array[i][field] === value) {
                return i;
            }
        }
    }

    return -1;
}

export class TestNode extends Node {
    recompile: boolean;
    running: boolean;
    provider: Account;
    zap: Account;
    nodeos_path: string;
    instance: any;
    user: Account;
    token: Account;

    constructor(verbose: boolean, recompile: boolean, endpoint: string) {
        super({
            verbose: verbose,
            key_provider: [ACC_TEST_PRIV_KEY, ACC_OWNER_PRIV_KEY],
            http_endpoint: 'http://127.0.0.1:8888',
            chain_id: ''
        });
        this.recompile = recompile;
        this.running = false;
        this.instance = null;
        this.nodeos_path = NODEOS_PATH;
        this.provider = new Account('zap.provider').usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.zap = this.getZapAccount().usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.user = new Account('user').usePrivateKey(ACC_TEST_PRIV_KEY);
        this.token = new Account('zap.token').usePrivateKey(ACC_OWNER_PRIV_KEY);
    }

    async run() {
        if (this.instance) {
            throw new Error('Test EOS node is already running.');
        }
        // use spawn function because nodeos has infinity output

      //  this.instance = spawn(this.nodeos_path, ['--contracts-console', '--delete-all-blocks', '--access-control-allow-origin=*']);
        this.instance = spawn(this.nodeos_path, ['-e -p eosio', '--delete-all-blocks', '--plugin eosio::producer_plugin', '--plugin eosio::history_plugin', '--plugin eosio::chain_api_plugin', '--plugin eosio::history_api_plugin', '--plugin eosio::http_plugin'], {shell: true, detached: true});
      // wait until node is running
        // wait until node is running

        while (this.running === false) {
            await waitEvent(this.instance.stderr, 'data');
            if (this.running === false) {
                this.running = true;
            }
        }

        if (this.verbose) console.log('Eos node is running.')
    }

    kill() {
        if (this.instance) {
            this.instance.kill();
            this.instance = null;
            this.running = false;
            if (this.verbose) console.log('Eos node killed.');
        }
    }

    async restart() {
        this.kill();
        await this.run();
    }


    async init() {

        if (!this.running) {
            throw new Error('Eos node must running receiver setup initial state.');
        }

        const eos = await this.connect();
        await this.registerAccounts(eos);
        await this.deploy(eos);
        await this.grantPermissions(eos);
    }


    async registerAccounts(eos: any) {
        const results = [];
        results.push(await this.provider.register(eos));
        results.push(await this.zap.register(eos));
        results.push(await this.token.register(eos));
        results.push(await this.user.register(eos));
        return results;
    }


    async deploy(eos: any) {
        const results: any = [];
        const deployer = new Deployer({eos: eos, contract_name: 'main'});
        deployer.from(this.zap);
        deployer.abi(Binaries.mainAbi);
        deployer.wasm(Binaries.mainWasm);
        results.push(await deployer.deploy());

        let createTokenTransaction = new Transaction()
            .sender(this.token)
            .receiver(this.token)
            .action('create')
            .data({issuer: this.token.name, maximum_supply: '1000000000 TST'});

        results.push(
            await new Deployer({eos: eos, contract_name: 'eosio.token'})
                .from(this.token)
                .abi(Binaries.tokenAbi)
                .wasm(Binaries.tokenWasm)
                .afterDeploy(createTokenTransaction)
                .deploy()
        );

        return results;
    }

    async grantPermissions(eos: any) {
        let newPermission = {
            permission: {
                actor: this.zap.name,
                permission: 'eosio.code'
            },
            weight: 1
        };

        let user = await eos.getAccount(this.user.name);
        let main = await eos.getAccount(this.zap.name);

        let newUserAuth = user.permissions[findElement(user.permissions, 'perm_name', 'active')];
        newUserAuth.required_auth.accounts.push(newPermission);

        let newMainAuth = main.permissions[findElement(main.permissions, 'perm_name', 'active')];
        newMainAuth.required_auth.accounts.push(newPermission);

        await eos.transaction((tr: any) => {
                tr.updateauth({
                    account: user.account_name,
                    permission: 'active',
                    parent: 'owner',
                    auth: newUserAuth.required_auth
                }, {authorization: `${user.account_name}@owner`});

                tr.updateauth({
                    account: main.account_name,
                    permission: 'active',
                    parent: 'owner',
                    auth: newMainAuth.required_auth
                }, {authorization: `${main.account_name}@owner`});
            }
        );
    }

    getProviderAccount() {
        return this.provider;
    }

    getUserAccount() {
        return this.user;
    }
    getTokenAccount() {
        return this.token;
    }
}
