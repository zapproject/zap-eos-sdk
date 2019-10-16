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
const fetch = require('node-fetch');
const src_1 = require("../../src");
const environment_1 = require("./environment");
function configureEnvironment(func) {
    return __awaiter(this, void 0, void 0, function* () {
        yield func();
    });
}
describe('Test', () => __awaiter(this, void 0, void 0, function* () {
    const url = 'http://127.0.0.1:8888';
    let node;
    let registry;
    const configure = () => __awaiter(this, void 0, void 0, function* () {
        try {
            node = new environment_1.TestNode(true, false, url, '');
            yield node.restart();
            yield node.connect();
            yield node.init();
            registry = yield new src_1.Regsitry({
                account: node.getProvider(),
                node
            });
        }
        catch (e) {
            console.log(e);
        }
    });
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield configureEnvironment(configure);
        });
    });
    it('#initiateProvider()', () => __awaiter(this, void 0, void 0, function* () {
        yield registry.initiateProvider('tests', 10);
        const res = yield registry.queryProviderList(0, -1, 10);
        yield expect(res.rows[0].title).to.be.equal('tests');
    }));
    it('#initiateEndpoints()', () => __awaiter(this, void 0, void 0, function* () {
        yield registry.addEndpoint('test_endpoints', [3, 0, 0, 2, 1], 'acc');
        const res = yield registry.queryProviderEndpoints(0, -1, 10);
        yield registry.addEndpoint('test_endpoints2', [3, 0, 0, 2, 1], 'acc');
        yield expect(res.rows[0].specifier).to.be.equal('test_endpoints');
    }));
    after(function () {
        node.kill();
    });
}));
