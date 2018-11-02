const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const path = require('path');
const fs = require('fs');
import {Regsitry} from "@zapjs/eos-registry";
import {Bondage} from "@zapjs/eos-bondage";
import {Dispatch} from "../../src";
import {Account, Deployer} from '@zapjs/eos-utils';
import {TestNode as Node} from './environment';
import * as Utils from "@zapjs/eos-utils";


async function configureEnvironment(func: Function) {
    await func();
}

describe('Test', () => {
    const node = new Node(false, false, 'http://127.0.0.1:8888');
    let registry: Regsitry;
    let bondage: Bondage;
    let dispatch: Dispatch;

    before(function (done) {
        this.timeout(30000);
        configureEnvironment(async () => {
            try {
                await node.restart();
                await node.init();
                registry = await new Regsitry({
                    account: node.getProvider(),
                    node
                });
                bondage = await new Bondage({
                    account: node.getProvider(),
                    node
                });
                dispatch = await new Dispatch({
                    account: node.getProvider(),
                    node
                });
            } catch (e) {
                console.log(e);
            }
            done();
        });
    });

    it('#query()', async () => {
        await registry.initiateProvider('tests', 10);
        const res = await registry.queryProviderList(0, -1, 10);
        await expect(res.rows[0].title).to.be.equal('tests');
    });
});
