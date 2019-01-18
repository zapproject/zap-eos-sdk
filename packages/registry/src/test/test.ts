const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const path = require('path');
const fs = require('fs');
import {Regsitry} from "../../src";
import {Account} from '@zapjs/eos-utils';
import {TestNode as Node} from './environment';
import * as Utils from "@zapjs/eos-utils";
import { assert } from "chai";


async function configureEnvironment(func: Function) {
    await func();
}

describe('Test', async () => {
    const node = new Node(false, false, 'http://127.0.0.1:8888');
    let registry: Regsitry;
    const configure = async () => {
        try {
            await node.restart();
            await node.init();
            registry = await new Regsitry({
                account: node.getProvider(),
                node
            });
        } catch (e) {
            console.log(e);
        }
    }


    before(async function() {
        this.timeout(30000);
        await configureEnvironment(configure);
    });

  it('#initiateProvider()', async () => {
        await registry.initiateProvider('tests', 10);
        const res = await registry.queryProviderList(0, -1, 10);
        await expect(res.rows[0].title).to.be.equal('tests');
    });
    it('#initiateEndpoints()', async () => {
        await registry.addEndpoint('test_endpoints', [3, 0, 0, 2, 1], 'acc');
        const res = await registry.queryProviderEndpoints(0, -1, 10);
        await registry.addEndpoint('test_endpoints2', [3, 0, 0, 2, 1], 'acc');
        await expect(res.rows[0].specifier).to.be.equal('test_endpoints');
    });
    after(function () {
        node.kill();
    })
});
