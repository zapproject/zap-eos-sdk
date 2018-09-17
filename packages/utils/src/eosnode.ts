import {nodeConfig, nodeOptions} from "./types/types";

const Sleep = require('sleep');
const Eos = require('eosjs');
const spawn = require('child_process').spawn;

const STARTUP_TIMEOUT = 30000;
const STARTUP_REQUESTS_DELAY = 100;
const STARTUP_BLOCK = 3;

function waitEvent(event:any, type: string) {
    return new Promise(function(resolve:Function, reject:Function) {
        function listener(data:any) {
            event.removeListener(type, listener);
            resolve(data);
        }

        event.on(type, listener);
    });
}
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
    running: boolean;
    instance: any;
    nodeos_path: string;

    constructor({verbose, key_provider, nodeos_path, http_endpoint, chain_id}: nodeOptions) {
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
        this.running = false;
        this.instance = null;
        this.nodeos_path = nodeos_path;
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

    async run() {
        if (this.instance) {
            throw new Error('Test EOS node is already running.');
        }

        // use spawn function because nodeos has infinity output
        this.instance = spawn(this.nodeos_path + '/nodeos', ['--contracts-console', '--delete-all-blocks', '--access-control-allow-origin=*']);

        // wait until node is running
        while (this.running === false) {
            await waitEvent(this.instance.stderr, 'data');

            if (this.running === false) {
                this.running = true;
            }

        }

        if (this.verbose) console.log('Eos node is running.')
    }

    kill() {
        if (this.instance) {
            this.instance.kill();
            this.instance = null;
            this.running = false;
            if (this.verbose) console.log('Eos node killed.');
        }
    }

    async restart() {
        this.kill();
        await this.run();
    }

    async connect() {
        if (!this.running) {
            throw new Error('Eos node must running for establishing connection.');
        }
        await this._waitNodeStartup(STARTUP_TIMEOUT);
        return Eos(this.eos_test_config);
    }

}

module.exports = Node;