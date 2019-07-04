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
        await minting.issueTokens([{id: node.provider.name, quantity: '1000 TST'}], 'hi');
        let tokensAmount = await node.rpc.get_currency_balance(node.token.name, 'zaptest12345', 'TST');
        await expect(tokensAmount[0].toString()).to.be.equal('1000 TST');
    });

    it('#transferTokens()', async () => {
        await minting.transferTokens(node.provider, [node.zap.name], '7 TST', 'hi', 'ZAP');
        let tokensAmountA = await node.rpc.get_currency_balance(node.token.name, node.zap.name, 'TST');
        await expect(tokensAmountA[0].toString()).to.be.equal('7 TST');
        let restTokensAmount = await node.rpc.get_currency_balance(node.token.name, node.provider.name, 'TST');
        await expect(restTokensAmount[0].toString()).to.be.equal('993 TST');
    });
});
