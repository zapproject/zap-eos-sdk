import {nodeConfig, nodeOptions} from "./types/types";
import {Account} from "./index";

const Sleep = require('sleep');
const Eos = require('eosjs');

const STARTUP_TIMEOUT = 30000;
const STARTUP_REQUESTS_DELAY = 100;
const STARTUP_BLOCK = 3;


function checkTimeout(startTime: Date, timeout: number) {
    let currentTime = new Date();
    let timeoutException = new Error('Timeout exception.');
    if (startTime.getTime() - currentTime.getTime() > timeout) {
        throw timeoutException
    }
}


export class Node {
    eos_test_config: nodeConfig;
    verbose: boolean;
    private _zap_account: Account = new Account('zap.main');

    constructor({verbose, key_provider, http_endpoint, chain_id}: nodeOptions) {
        this.eos_test_config = {
            chainId: chain_id, // 32 byte (64 char) hex string
            keyProvider: key_provider, // WIF string or array of keys..
            httpEndpoint: http_endpoint,
            expireInSeconds: 60,
            broadcast: true,
            verbose: verbose, // API activity
            sign: true
        };

        this.verbose = verbose;
    }

    async _waitNodeStartup(timeout: number) {
        // wait for block production
        let startTime = new Date();
        let eos = Eos(this.eos_test_config);
        while (true) {
            try {
                let res = await eos.getInfo({});
                if (res.head_block_producer) {
                    while (true) {
                        try {
                            let res = await eos.getBlock(STARTUP_BLOCK);
                            break;
                        } catch (e) {
                            Sleep.msleep(STARTUP_REQUESTS_DELAY);
                            checkTimeout(startTime, timeout);
                        }
                    }
                    break;
                }
            } catch (e) {
                Sleep.msleep(STARTUP_REQUESTS_DELAY);
                checkTimeout(startTime, timeout);
            }
        }
    }

    async connect() {
        await this._waitNodeStartup(STARTUP_TIMEOUT);
        return Eos(this.eos_test_config);
    }

    getZapAccount() {
        return this._zap_account;
    }

}