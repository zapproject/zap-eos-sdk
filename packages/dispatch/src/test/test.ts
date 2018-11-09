const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const path = require('path');
const fs = require('fs');
import {Regsitry} from "@zapjs/eos-registry";
import {Bondage} from "@zapjs/eos-bondage";
import {Dispatch} from "../../src";
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
    let dispatch: Dispatch;

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
                dispatch = new Dispatch({
                    account: node.getUserAccount(),
                    node
                });

            } catch (e) {
                console.log(e);
            }
            done();
        });
    });

    it('#query()', async () => {
        let eos = await node.connect();
        await registry.initiateProvider('tests', 10);
        await registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
        await bondage.bond(node.getProviderAccount().name, 'endp', 1);
        await dispatch.query(node.getProviderAccount().name, 'endp', 'test_query', false);

        let qdata = await getRowsByPrimaryKey(eos, node, node.getZapAccount().name, 'qdata', 'id');
        let holder = await getRowsByPrimaryKey(eos, node, node.getUserAccount().name, 'holder', 'provider');

        await expect(qdata.rows[0].data).to.be.equal('test_query');
        await expect(holder.rows[0].escrow).to.be.equal(1);
        await expect(holder.rows[0].dots).to.be.equal(0);
    });

    after(() => {
        node.kill();
    })
});
