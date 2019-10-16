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
const { BaseActionWatcher } = require("demux");
const { NodeosActionReader, AbstractActionHandler } = require("demux-eos"); // eslint-disable-line
const ObjectActionHandler_1 = require("./ObjectActionHandler");
const updaters_1 = require("./updaters");
const effects_1 = require("./effects");
const simpleListener_1 = require("./simpleListener");
const saveToBase_1 = require("./saveToBase");
function startDemux() {
    return __awaiter(this, void 0, void 0, function* () {
        const handlerVersion = {
            versionName: "v1",
            updaters: updaters_1.updaters,
            effects: effects_1.effects,
        };
        const actionHandler = new ObjectActionHandler_1.ObjectActionHandler([handlerVersion]);
        const latest = yield new NodeosActionReader({
            startAtBlock: 1,
            onlyIrreversible: false,
            nodeosEndpoint: process.argv[2]
        }).getHeadBlockNumber();
        const actionReader = new NodeosActionReader({
            startAtBlock: latest,
            onlyIrreversible: false,
            nodeosEndpoint: process.argv[2]
        });
        const actionWatcher = new BaseActionWatcher(actionReader, actionHandler, 100);
        actionWatcher.watch();
    });
}
function startSmallListener() {
    return __awaiter(this, void 0, void 0, function* () {
        const list = new simpleListener_1.SimpleEventListener(process.argv[2], 1);
        yield list.initiate();
        list.listen((res, payload) => saveToBase_1.updateTransferData(null, payload[0], null, null), process.argv[3]);
    });
}
if (process.argv[5] === 'smallListener') {
    startSmallListener();
}
else {
    startDemux();
}
