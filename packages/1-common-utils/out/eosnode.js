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
const index_1 = require("./index");
const eosjs_1 = require("eosjs");
const eosjs_jssig_1 = require("eosjs/dist/eosjs-jssig");
const nodeTextDecoder = require('util').TextDecoder;
const nodeTextEncoder = require('util').TextEncoder;
const edgeTextEncoder = require('text-encoding').TextEncoder;
const edgeTextDecoder = require('text-encoding').TextDecoder;
const _fetch = require('node-fetch');
//const Sleep = require('sleep');
const Eos = require('eosjs');
const STARTUP_TIMEOUT = 30000;
const STARTUP_REQUESTS_DELAY = 100;
const STARTUP_BLOCK = 6;
function checkTimeout(startTime, timeout) {
    let currentTime = new Date();
    let timeoutException = new Error('Timeout exception.');
    if (startTime.getTime() - currentTime.getTime() > timeout) {
        throw timeoutException;
    }
}
class Node {
    constructor({ verbose, key_provider, http_endpoint, chain_id, contract, scatter }) {
        this.testnet = http_endpoint;
        this._zap_account = new index_1.Account(contract);
        this.verbose = verbose;
        //@ts-ignore
        this.rpc = new eosjs_1.JsonRpc(http_endpoint.fullhost ? http_endpoint.fullhost() : http_endpoint, { fetch: typeof navigator === 'undefined' ? _fetch : fetch });
        if (!scatter && key_provider) {
            const signatureProvider = new eosjs_jssig_1.JsSignatureProvider(key_provider);
            this.api = new eosjs_1.Api({
                rpc: this.rpc,
                chainId: chain_id,
                signatureProvider,
                textDecoder: (typeof navigator === 'undefined') ? new nodeTextDecoder() :
                    navigator.product == 'ReactNative' || /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent) ?
                        new edgeTextDecoder() : new TextDecoder(),
                textEncoder: (typeof navigator === 'undefined') ? new nodeTextEncoder :
                    navigator.product == 'ReactNative' || /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent) ?
                        new edgeTextEncoder() : new TextEncoder()
            });
            return;
        }
        this.api = scatter.eos(http_endpoint, eosjs_1.Api, { rpc: this.rpc, beta3: true });
    }
    sleep(miliseconds) {
        var currentTime = new Date().getTime();
        while (currentTime + miliseconds >= new Date().getTime()) {
        }
    }
    _waitNodeStartup(timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            let startTime = new Date();
            while (true) {
                try {
                    let res = yield this.rpc.get_info({});
                    if (res.head_block_producer) {
                        while (true) {
                            try {
                                let res = yield this.rpc.get_block(STARTUP_BLOCK);
                                break;
                            }
                            catch (e) {
                                this.sleep(STARTUP_REQUESTS_DELAY);
                                checkTimeout(startTime, timeout);
                            }
                        }
                        break;
                    }
                }
                catch (e) {
                    this.sleep(STARTUP_REQUESTS_DELAY);
                    checkTimeout(startTime, timeout);
                }
            }
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._waitNodeStartup(STARTUP_TIMEOUT);
        });
    }
    getZapAccount() {
        return this._zap_account;
    }
}
exports.Node = Node;
