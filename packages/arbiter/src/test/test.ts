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
        await bondage.handlePermission(node.zap.name, 'add');
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
