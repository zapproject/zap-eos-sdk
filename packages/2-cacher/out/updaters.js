"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const saveToBase_1 = require("./saveToBase");
const account = process.argv[3];
exports.updaters = [
    {
        actionType: "eosio.token::transfer",
        apply: saveToBase_1.updateTransferData,
    },
    {
        actionType: `${account}::addendpoint`,
        apply: saveToBase_1.updateTransferData,
    },
    {
        actionType: `${account}::newprovider`,
        apply: saveToBase_1.updateTransferData,
    },
    {
        actionType: `${account}::bond`,
        apply: saveToBase_1.updateTransferData,
    },
    {
        actionType: `${account}::unbond`,
        apply: saveToBase_1.updateTransferData,
    },
    {
        actionType: `${account}::estimate`,
        apply: saveToBase_1.updateTransferData,
    },
    {
        actionType: `${account}::query`,
        apply: saveToBase_1.updateTransferData,
    },
    {
        actionType: `${account}::cancelquery`,
        apply: saveToBase_1.updateTransferData,
    },
    {
        actionType: `${account}::respond`,
        apply: saveToBase_1.updateTransferData,
    },
    {
        actionType: `${account}::subscribe`,
        apply: saveToBase_1.updateTransferData,
    },
    {
        actionType: `${account}::unsubscribe`,
        apply: saveToBase_1.updateTransferData,
    }
];
