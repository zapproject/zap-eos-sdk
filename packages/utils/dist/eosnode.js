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
const account_1 = require("./account");
const Eos = require('eosjs');
const STARTUP_TIMEOUT = 30000;
const STARTUP_REQUESTS_DELAY = 100;
const STARTUP_BLOCK = 3;
function checkTimeout(startTime, timeout) {
    let currentTime = new Date();
    let timeoutException = new Error('Timeout exception.');
    if (startTime.getTime() - currentTime.getTime() > timeout) {
        throw timeoutException;
    }
}
function sleep(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, timeout);
    });
}
exports.sleep = sleep;
class Node {
    constructor({ verbose, key_provider, http_endpoint, chain_id }) {
        this._zap_account = new account_1.Account('zap.main');
        this.eos_config = {
            chainId: chain_id,
            keyProvider: key_provider,
            httpEndpoint: http_endpoint,
            expireInSeconds: 60,
            broadcast: true,
            verbose: verbose,
            sign: true
        };
        this.verbose = verbose;
    }
    _waitNodeStartup(timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            // wait for block production
            let startTime = new Date();
            let eos = Eos(this.eos_config);
            while (true) {
                try {
                    let res = yield eos.getInfo({});
                    if (res.head_block_producer) {
                        while (true) {
                            try {
                                let res = yield eos.getBlock(STARTUP_BLOCK);
                                break;
                            }
                            catch (e) {
                                sleep(STARTUP_REQUESTS_DELAY);
                                checkTimeout(startTime, timeout);
                            }
                        }
                        break;
                    }
                }
                catch (e) {
                    sleep(STARTUP_REQUESTS_DELAY);
                    checkTimeout(startTime, timeout);
                }
            }
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._waitNodeStartup(STARTUP_TIMEOUT);
            return Eos(this.eos_config);
        });
    }
    getZapAccount() {
        return this._zap_account;
    }
}
exports.Node = Node;
//# sourceMappingURL=eosnode.js.map