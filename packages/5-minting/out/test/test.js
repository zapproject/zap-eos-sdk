"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const path = require('path');
const fs = require('fs');
const minting_1 = require("../../src/minting");
const environment_1 = require("./environment");
function configureEnvironment(func) {
    return __awaiter(this, void 0, void 0, function* () {
        yield func();
    });
}
//PW5KZEbYJLwbSPr8buQy1Uki5WVS8HLcz1VcpWik5Mba4os4RpPwc
describe('Test', () => {
    const node = new environment_1.TestNode(false, false, 'http://127.0.0.1:8888', '');
    let minting;
    before(function (done) {
        this.timeout(30000);
        configureEnvironment(() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield node.restart();
                yield node.connect();
                yield node.init();
                minting = yield new minting_1.tokenMinting(node.token, node);
            }
            catch (e) {
                console.log(e);
            }
            done();
        }));
    });
    it('#issueTokens()', () => __awaiter(this, void 0, void 0, function* () {
        yield minting.issueTokens([{ id: node.provider.name, quantity: '1000 TST' }], 'hi');
        let tokensAmount = yield node.rpc.get_currency_balance(node.token.name, 'zaptest12345', 'TST');
        yield expect(tokensAmount[0].toString()).to.be.equal('1000 TST');
    }));
    it('#transferTokens()', () => __awaiter(this, void 0, void 0, function* () {
        yield minting.transferTokens(node.provider, [node.zap.name], '7 TST', 'hi', 'ZAP');
        let tokensAmountA = yield node.rpc.get_currency_balance(node.token.name, node.zap.name, 'TST');
        yield expect(tokensAmountA[0].toString()).to.be.equal('7 TST');
        let restTokensAmount = yield node.rpc.get_currency_balance(node.token.name, node.provider.name, 'TST');
        yield expect(restTokensAmount[0].toString()).to.be.equal('993 TST');
    }));
});
