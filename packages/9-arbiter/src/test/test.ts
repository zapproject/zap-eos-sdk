const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
import {Regsitry} from "@zapjs/eos-registry";
import {Bondage} from "@zapjs/eos-bondage";
import {Arbiter} from "../../src";
import {TestNode as Node} from './environment';
import * as Utils from "@zapjs/eos-utils";
import {Minting} from "@zapjs/eos-minting";

async function configureEnvironment(func: Function) {
    await func();
}

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
    let main: Bondage;
    let arbiterSub: Arbiter;
    let arbiterProvider: Arbiter;
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
                arbiterSub = new Arbiter({
                    account: node.user,
                    node
                });

                arbiterProvider = new Arbiter({
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

    it('#subscribe()', async () => {
        await handlePermission(node.user, node.zap.name, 'add', node);
        await minting.issueTokens([{id: node.user.name, quantity: '300000 TST'}], 'hi');
        await registry.initiateProvider('tests', 10);
        await registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
        await bondage.bond(node.provider.name, 'endp', 6);
        await arbiterSub.subscribe(node.provider.name, 'endp', 3, '{p: 1}');
    });

    it('#querySubscriptions()', async () => {
        let res = await arbiterSub.querySubscriptions(node.provider.name, 0, -1, 10);
        await expect(res.rows[0].price).to.be.equal(3);
        await expect(res.rows[0].subscriber).to.be.equal(node.user.name);
    });

    it('#unsubscribeSubscriber()', async () => {
        await arbiterSub.unsubscribeSubscriber(node.provider.name, 'endp');
        let res = await arbiterSub.querySubscriptions(node.provider.name, 0, -1, 10);
        await expect(res.rows.length).to.be.equal(0);
    });

    it('#unsubscribeProvider()', async () => {
        await arbiterSub.subscribe(node.provider.name, 'endp', 2, '{p: 2}');
        await arbiterProvider.unsubscribeProvider(node.user.name, 'endp');
        let res = await arbiterSub.querySubscriptions(node.provider.name, 0, -1, 10);
        await expect(res.rows.length).to.be.equal(0);
    });

    after(() => {
        node.kill();
    })
});
