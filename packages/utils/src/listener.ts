const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';
const fork = require('child_process').fork;
const program = path.resolve(__dirname,'..', '..', '..', 'packages/cacher/out/index.js');
const program2 = path.resolve(__dirname,'..', 'node_modules/@zapjs/eos-caching/out/index.js');
const options = {stdio:    ['pipe', 1, 2, 'ipc']};
let child: any;
import {Message} from "./types/types";


export class EventObserver {
    lastTakenId: any;
    process: boolean;
    observerFunction: Function | undefined;
    incoming: any;
    constructor () {
        this.lastTakenId = null;
        this.process = false;
        this.incoming = null;
    }

    on (action: string, fn?: Function) {
        this.observerFunction = fn;
        child.on('message', (message: any) => {
            if (action !== `${message.account}::${message.name}`) return;
            this.incoming = {...message};
        });
        setInterval(() => {
            if((this.incoming && !this.lastTakenId) ||
            (this.incoming && ObjectId(this.incoming.id) > ObjectId(this.lastTakenId))) this.broadcast(this.incoming);
        },500);
    }

    static async getPossibleLostAnswer(id: number, subscriber: string, provider: string, timestamp: number) {
        const dbName = 'local';
        const client = await MongoClient.connect(url, { useNewUrlParser: true });
        const db = client.db(dbName);
        const collection = db.collection("respond");
        const res = await collection.findOne({"data.id": id, "data.subscriber": subscriber, "data.provider": provider, "createdAt": { "$gt" : timestamp } });
        return (res) ? res.data.params : '';
    }
    async broadcast (info: Message) {
        if (this.process) return;

        this.process = true;

        const dbName = 'local';
        const client = await MongoClient.connect(url, { useNewUrlParser: true });
        const db = client.db(dbName);
        const collection = db.collection(info.name);


        const params = (this.lastTakenId) ? {"_id" : { "$gt" : ObjectId(this.lastTakenId) }} : {"_id" : { "$gte" : ObjectId(info.id) }};
        const res = await collection.find(params).toArray();
        if(this.observerFunction) this.observerFunction(null, res);
        this.lastTakenId = res[res.length - 1]._id;
        this.process = false;
    }

    kill() {
            if (child) child.kill();
    }

    static async start(params: [string, string]) {
        const Mongodoki = require('mongodoki').Mongodoki;
        const md = new Mongodoki();
        let gDb: any = null;
        try {
            console.log("wait caching starts...")
            gDb = await md.getDB();
        } catch (err) { console.log(err) }
        if(gDb) child = fork(program, params, options);
        else process.exit(0);
    }
}
