const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const path = require('path');
const fs = require('fs');
import {Regsitry} from "@zapjs/eos-registry";
import {Minting} from "@zapjs/minting";
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
                node = new Node(false, false, 'http://127.0.0.1:8888');
                await node.restart();
                await node.init();
                await node.connect();
                registry = new Regsitry({
                    account: node.getProviderAccount(),
                    node
                });
                bondage = new Bondage({
                    account: node.getUserAccount(),
                    node
                });
                bondageProvider = new Bondage({
                    account: node.getProviderAccount(),
                    node
                });
                minting = await new Minting(node.getTokenAccount(), node);

            } catch (e) {
                console.log(e);
            }
            done();
        });
    });

    it('#bond()', async () => {
        let eos = await node.connect();
        await minting.issueTokens([{id: node.getUserAccount().name, quantity: '300000 TST'}], 'hi');
        await registry.initiateProvider('tests', 10);
        await registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
        await bondage.bond(node.getProviderAccount().name, 'endp', 1);
        const issued = await bondageProvider.queryIssued(0, 1, 1);
        const holders = await bondage.queryHolders(0, -1, 10);
        await expect(issued.rows[0].dots).to.be.equal(1);
        await expect(holders.rows[0].dots).to.be.equal(1);
    });
    it('#unbond()', async () => {
      await bondage.unbond(node.getProviderAccount().name, 'endp', 1);
      const issued = await bondageProvider.queryIssued(0, 1, 1);
      const holders = await bondage.queryHolders(0, -1, 10);
      await expect(issued.rows[0].dots).to.be.equal(0);
      await expect(holders.rows[0].dots).to.be.equal(0);
    });

    after(() => {
        node.kill();
    })
});
describe('Test-listeners', () => {
    let node: any;
    let registry: Regsitry;
    let bondage: Bondage;
    let minting: Minting;

    before(function (done) {
        this.timeout(30000);
        configureEnvironment(async () => {
            try {
                node = new Node(false, false, 'http://127.0.0.1:8888');
                await node.restart();
                await node.init();
                await node.connect();
                registry = new Regsitry({
                    account: node.getProviderAccount(),
                    node
                });
                bondage = new Bondage({
                    account: node.getUserAccount(),
                    node
                });
                minting = await new Minting(node.getTokenAccount(), node);

            } catch (e) {
                console.log(e);
            }
            done();
        });
    });

    it('#listenBond()', done => {
        bondage.listenBond(async (data: any) => {
            try {
                await expect(data[0].data.dots).to.be.equal(1);
                done();
            }catch(err){done (err)}
        });
        minting.issueTokens([{id: node.getUserAccount().name, quantity: '300000 TST'}], 'hi').then(() =>
        registry.initiateProvider('tests', 10)).then(() =>
        registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '')).then(() =>
        bondage.bond(node.getProviderAccount().name, 'endp', 1));
      ;
    });
    it('#listenUnbond()', done => {
        bondage.listenUnbond(async (data: any) => {
            try {
                await expect(data[0].name).to.be.equal('unbond');
                done();
            }catch(err){done (err)}
        });
        bondage.unbond(node.getProviderAccount().name, 'endp', 1);
    });

    after(() => {
        node.kill();
    })
});
