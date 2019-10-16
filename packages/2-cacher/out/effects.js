"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function logUpdate(state, payload, blockInfo, context) {
    console.info(payload);
}
exports.effects = [
    {
        actionType: "zapcoretest1::bond",
        effect: logUpdate,
    },
];
