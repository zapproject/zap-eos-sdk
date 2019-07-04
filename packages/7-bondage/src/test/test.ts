const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const path = require('path');
const fs = require('fs');
import {Regsitry} from "@zapjs/eos-registry";
import {Minting} from "@zapjs/eos-minting";
import {Bondage} from "../";
import {TestNode as Node} from './environment';
import * as Utils from "@zapjs/eos-utils";

async function handlePermission(_account: Utils.Account, contract: string, type: string, node: any) {
    const account = await node.rpc.get_account(_account.name);
    const { accounts, keys, waits }  = JSON.parse(JSON.stringify(account.permissions)).filter((x: any) => x.perm_name === 'active')[0].required_auth;
    if(type !=='add' && type !== 'remove') return;
    if (type === 'add' && accounts.filter((x: any) => x.permission.actor == contract).length) return;            
    
    const newPermission = [{
        "permission": {
            "actor": contract,
            "permission": "eosio.code"
        },
        "weight": 1
    }];

    const newKeys = keys.length ? keys : [
        {
            "key": (await node.api.signatureProvider.getAvailableKeys())[0],
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
            "accounts": type === 'add' ? accounts.concat(newPermission) : accounts.filter((x: any) => x.permission.actor !== contract),
            "waits": waits
        }
    }
    
    return await new Utils.Transaction()
        .sender(_account, 'owner')
        .receiver(new Utils.Account('eosio'))
        .action('updateauth')
        .data(data)
        .execute(node.api);
}

async function configureEnvironment(func: Function) {
    await func();
}

async function getRowsByPrimaryKey(eos: any, node: any, scope: string, table_name: string, table_key: string) {
    return await eos.getTableRows(
        true, // json
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
}

describe('Test', () => {
    let node: any;
    let registry: Regsitry;
    let bondage: Bondage;
    let bondageProvider: Bondage;
    let main: Bondage;
    let minting: Minting;

    before(function (done) {
        this.timeout(30000);
        configureEnvironment(async () => {
            try {
                node = new Node(false, false, 'http://127.0.0.1:8888', '');
                await node.restart();
                await node.connect();
                await node.init();
                registry = new Regsitry({
                    account: node.provider,
                    node
                });
                bondage = new Bondage({
                    account: node.user,
                    node
                });
                bondageProvider = new Bondage({
                    account: node.provider,
                    node
                });
                main = new Bondage({
                    account: node.zap,
                    node
                });
                minting = await new Minting(node.token, node);

            } catch (e) {
                console.log(e);
            }
            done();
        });
    });

    it('#bond()', async () => {
        await handlePermission(node.user, node.zap.name, 'add', node);
        await minting.issueTokens([{id: node.user.name, quantity: '300000 TST'}], 'hi');
        await registry.initiateProvider('tests', 10);
        await registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
        await bondage.bond(node.provider.name, 'endp', 1);
        const issued = await bondageProvider.queryIssued(0, 1, 1);
        const holders = await bondage.queryHolders(0, -1, 10);
        await expect(issued.rows[0].dots).to.be.equal(1);
        await expect(holders.rows[0].dots).to.be.equal(1);
    });
    it('#unbond()', async () => {
        await handlePermission(node.user, node.zap.name, 'add', node);
        await bondage.unbond(node.provider.name, 'endp', 1);
        const issued = await bondageProvider.queryIssued(0, 1, 1);
        const holders = await bondage.queryHolders(0, -1, 10);
        await expect(issued.rows[0].dots).to.be.equal(0);
        await expect(holders.rows[0].dots).to.be.equal(0);
    });

    after(() => {
        node.kill();
    })
});
