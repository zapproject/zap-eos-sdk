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
                    account: node.token,
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
        await bondage.handlePermission(node.zap.name, 'add');
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
        //await bondage.handlePermission(node.zap.name, 'add');
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
