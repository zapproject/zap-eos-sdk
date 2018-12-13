const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';
const fork = require('child_process').fork;
const program = path.resolve(__dirname,'..', '..', '..', 'packages/cacher/out/index.js');
const parameters = ['zap.main'];
const options = {stdio:  ['pipe', 1, 2, 'ipc']};
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

  async takeNext(provider: string, action: string, lastTaken: string, fn?: Function) {
    const dbName = 'test';
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(dbName);
    const collection = db.collection(action.split('::')[1]);


    const params = (lastTaken) ? {"_id" : { "$gt" : ObjectId(lastTaken) }, "answered": false, "data.provider": provider} :
                                 {"_id" : { "$gt" : ObjectId.createFromTime(Date.now() / 1000 - 2*60*60) }, "answered": false, "data.provider": provider};
    const res = await collection.find(params).limit(1).toArray();
    console.log(res);


    if(fn) fn(null, res);
  }

  static async updateQuery(subscriber: string, timestamp: number, answer: string) {
    const dbName = 'test';
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(dbName);
    const collection = db.collection("query")
    const params = { "data.subscriber": subscriber, "data.timestamp": timestamp }
    await collection.updateOne(params, { $set: { "answered": true, "response": answer } });
  }

  static async getAnswer(subscriber: string, timestamp: number) {
    const dbName = 'test';
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(dbName);
    const collection = db.collection("query")
    const params = { "data.subscriber": subscriber, "data.timestamp": timestamp }
    const row = await collection.findOne(params);
    return row.answer;
  }
  /*static async getAnswers(subscriber: string) {
    const dbName = 'test';
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(dbName);
    const collection = db.collection("query")
    const params = { "data.subscriber": subscriber}
    const row = await collection.find(params).toArray();
    return row.answer;
  }*/

  async broadcast (info: Message) {
    if (this.process) return;

    this.process = true;

    const dbName = 'test';
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

  static start() {
    child = fork(program, parameters, options);
  }
}
