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
const { AbstractActionHandler } = require("demux");
// Initial state
let state = {
    volumeBySymbol: {},
    totalTransfers: 0,
    indexState: {
        blockNumber: 0,
        blockHash: "",
        isReplay: false,
        handlerVersionName: "v1",
    },
};
const stateHistory = {};
const stateHistoryMaxLength = 300;
exports.default = AbstractActionHandler;
class ObjectActionHandler extends AbstractActionHandler {
    constructor(handlers) {
        super(handlers);
    }
    handleWithState(handle) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handle(state);
            const { blockNumber } = state.indexState;
            stateHistory[blockNumber] = JSON.parse(JSON.stringify(state));
            if (blockNumber > stateHistoryMaxLength && stateHistory[blockNumber - stateHistoryMaxLength]) {
                delete stateHistory[blockNumber - stateHistoryMaxLength];
            }
        });
    }
    loadIndexState() {
        return __awaiter(this, void 0, void 0, function* () {
            return state.indexState;
        });
    }
    updateIndexState(stateObj, block, isReplay, handlerVersionName) {
        return __awaiter(this, void 0, void 0, function* () {
            stateObj.indexState.blockNumber = block.blockInfo.blockNumber;
            stateObj.indexState.blockHash = block.blockInfo.blockHash;
            stateObj.indexState.isReplay = isReplay;
            stateObj.indexState.handlerVersionName = handlerVersionName;
        });
    }
    rollbackTo(blockNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestBlockNumber = state.indexState.blockNumber;
            const toDelete = [...Array(latestBlockNumber - (blockNumber)).keys()].map(n => n + blockNumber + 1);
            for (const n of toDelete) {
                delete stateHistory[n];
            }
            state = stateHistory[blockNumber];
        });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.ObjectActionHandler = ObjectActionHandler;
