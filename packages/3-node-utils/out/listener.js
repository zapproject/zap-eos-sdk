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
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb://172.17.0.2:27017';
const fork = require('child_process').fork;
const program = path.resolve(__dirname, '../../../.bin/listen-eos');
const options = { stdio: ['pipe', 1, 2, 'ipc'] };
let child;
const events = require('events');
const eosActionsEventEmitter = new events.EventEmitter();
class EventObserver {
    constructor() {
        this.lastTakenId = null;
        this.process = false;
        this.incoming = null;
        this.newIncoming = this.newIncoming.bind(this);
    }
    newIncoming(message) {
        if (this.action !== `${message.account}::${message.name}`)
            return;
        this.incoming = Object.assign({}, message);
    }
    ;
    on(action, fn) {
        this.observerFunction = fn;
        this.action = action;
        eosActionsEventEmitter.addListener('message', this.newIncoming);
        this.intervalId = setInterval(() => {
            if ((this.incoming && !this.lastTakenId) ||
                (this.incoming && ObjectId(this.incoming.id) > ObjectId(this.lastTakenId)))
                this.broadcast(this.incoming);
        }, 500);
    }
    off() {
        clearInterval(this.intervalId);
        eosActionsEventEmitter.removeListener('message', this.newIncoming);
    }
    static getPossibleLostAnswer(id, subscriber, provider, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbName = 'local';
            const client = yield MongoClient.connect(url, { useNewUrlParser: true });
            const db = client.db(dbName);
            const collection = db.collection("respond");
            const res = yield collection.findOne({ "data.id": id, "data.subscriber": subscriber, "data.provider": provider, "createdAt": { "$gt": timestamp } });
            return (res) ? res.data.params : '';
        });
    }
    broadcast(info) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.process)
                return;
            this.process = true;
            const dbName = 'local';
            const client = yield MongoClient.connect(url, { useNewUrlParser: true });
            const db = client.db(dbName);
            const collection = db.collection(info.name);
            const params = (this.lastTakenId) ? { "_id": { "$gt": ObjectId(this.lastTakenId) } } : { "_id": { "$gte": ObjectId(info.id) } };
            const res = yield collection.find(params).toArray();
            if (this.observerFunction)
                this.observerFunction(null, res);
            this.lastTakenId = res[res.length - 1]._id;
            this.process = false;
        });
    }
    kill() {
        if (child)
            child.kill();
    }
    static start(params) {
        return __awaiter(this, void 0, void 0, function* () {
            child = fork(program, params, options);
            child.on('message', (message) => eosActionsEventEmitter.emit("message", message));
            console.log("api server started");
        });
    }
}
exports.EventObserver = EventObserver;
