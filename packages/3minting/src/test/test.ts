const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const path = require('path');
const fs = require('fs');
import {tokenMinting} from "../../src/minting";
import {Account} from '@zapjs/eos-utils';
import {TestNode as Node} from './environment';



async function configureEnvironment(func: Function) {
    await func();
}

//PW5KZEbYJLwbSPr8buQy1Uki5WVS8HLcz1VcpWik5Mba4os4RpPwc


describe('Test', () => {
    const node = new Node(false, false, 'http://127.0.0.1:8888', '');
    let minting: any;

    before(function (done) {
        this.timeout(30000);
        configureEnvironment(async () => {
            try {
                await node.restart();
                await node.connect();
                await node.init();
                minting = await new tokenMinting(node.token, node);
            } catch (e) {
                console.log(e);
            }
            done();
        });
    });

    it('#issueTokens()', async () => {
        console.log(await minting.issueTokens([{id: 'zaptest12345', quantity: '10000 ZAP'}], 'hi'));
        let tokensAmount = await node.rpc.get_currency_balance('zap.token', 'zaptest12345', 'ZAP');
        console.log(tokensAmount)
        //await expect(tokensAmount[0].toString()).to.be.equal('10000 TST');
    });

    it('#transferTokens()', async () => {
        await minting.transferTokens(node.provider, [node.zap.name], '7 TST', 'hi');
        let tokensAmountA = await node.rpc.get_currency_balance(node.zap.name, 'receiver', 'TST');
        await expect(tokensAmountA[0].toString()).to.be.equal('7 TST');
        let tokensAmountB = await node.rpc.get_currency_balance(node.zap.name, 'main', 'TST');
        await expect(tokensAmountB[0].toString()).to.be.equal('7 TST');
        let restTokensAmount = await node.rpc.get_currency_balance(node.zap.name, 'user', 'TST');
        await expect(restTokensAmount[0].toString()).to.be.equal('9986 TST');
    });
});
