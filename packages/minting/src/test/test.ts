const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
const path = require('path');
const fs = require('fs');
import { tokenMinting } from "../../src/minting";
import { Account, Deployer } from '@zapjs/eos-utils';
import { TestNode as Node} from './environment';
import * as Utils from "@zapjs/eos-utils";



async function configureEnvironment(func: Function) {
    await func();
}
//PW5KZEbYJLwbSPr8buQy1Uki5WVS8HLcz1VcpWik5Mba4os4RpPwc


describe('Test', () => {
    const node =  new Node(false, false, 'http://127.0.0.1:8888');
    let minting: any;
    before(function (done) {
        this.timeout(30000);
        configureEnvironment(async () => {
            try {
                await node.restart();
                await node.init();
                minting = await new tokenMinting(node.getAccounts().zap, node);
        } catch (e) { console.log(e); }
        done();
        });
    });

    it('#issueTokens()', async() => {
        const eos = await node.connect();
        await minting.issueTokens([{id: 'user', quantity: '10000 TST'}], 'hi');
        let tokensAmount = await eos.getCurrencyBalance('zap.main', 'user', 'TST');
        await expect(tokensAmount[0].toString()).to.be.equal('10000 TST');
     });
    it('#transferTokens()', async() => {
        const eos = await node.connect();
        await minting.transferTokens(node.getAccounts().account_user, ['receiver'], '7 TST', 'hi');
        let tokensAmount = await eos.getCurrencyBalance(node.getAccounts().zap.name, 'receiver', 'TST');
        await expect(tokensAmount[0].toString()).to.be.equal('7 TST');
        let restTokensAmount = await eos.getCurrencyBalance(node.getAccounts().zap.name, 'user', 'TST');
        await expect(restTokensAmount[0].toString()).to.be.equal('9993 TST');
    });
});
