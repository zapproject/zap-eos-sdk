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
const fetch = require('node-fetch');
class SimpleEventListener {
    constructor(nodeosEndpoint, startBlock) {
        this._listen = true;
        this._currentBlock = startBlock;
        this._startBlock = startBlock;
    }
    initiate() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`${process.argv[2]}/v1/chain/get_info`);
            const { head_block_num } = yield res.json();
            this._currentBlock = head_block_num;
        });
    }
    listen(callback, actionName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                while (this._listen) {
                    const resp = yield fetch(`${process.argv[2]}/v1/chain/get_info`);
                    const { head_block_num } = yield resp.json();
                    const quantity = head_block_num - this._currentBlock;
                    const promises = [];
                    for (let i = 1; i <= quantity; i++) {
                        promises.push(fetch(`${process.argv[2]}/v1/chain/get_block`, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ "block_num_or_id": this._currentBlock + i })
                        }).then((res) => res.json()));
                    }
                    const res = yield Promise.all(promises);
                    res.forEach((block) => {
                        if (block && block.transactions && block.transactions) {
                            block.transactions.forEach((tr) => {
                                if (!tr.trx || !tr.trx.transaction || !tr.trx.transaction.actions)
                                    return;
                                const listenedActions = SimpleEventListener.findContract(tr.trx.transaction.actions, actionName);
                                if (callback && listenedActions.length > 0) {
                                    callback(block.block_num, Object.assign({}, listenedActions, { transactionId: tr.trx.id }));
                                }
                            });
                        }
                    });
                    this._currentBlock += quantity;
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    stopListen() {
        this._listen = false;
    }
    static findContract(actions, contract) {
        let found = [];
        if (!contract || contract === '') {
            found = actions;
        }
        else {
            for (let i in actions) {
                if (actions[i].account === contract) {
                    found.push(actions[i]);
                }
            }
        }
        return found;
    }
}
exports.SimpleEventListener = SimpleEventListener;
