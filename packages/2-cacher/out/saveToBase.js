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
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = "mongodb://172.17.0.2:27017";
function updateTransferData(state, payload, blockInfo, context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = yield MongoClient.connect(url, { useNewUrlParser: true });
            const db = client.db("local");
            const collection = db.collection(payload.name);
            collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 24 * 3600 * parseInt(process.argv[4]) });
            const s = yield collection.insertOne({
                transactionId: payload.transactionId,
                account: payload.account,
                name: payload.name,
                authorization: payload.authorization,
                data: payload.data,
                createdAt: Date.now(),
            });
            process.send({ id: s.insertedId, account: payload.account, name: payload.name });
        }
        catch (e) {
            console.log(e);
        }
    });
}
exports.updateTransferData = updateTransferData;
