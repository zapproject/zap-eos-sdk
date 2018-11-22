const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';
const fork = require('child_process').fork;
const program = path.resolve(__dirname,'..', '..', '..', 'packages/cacher/out/index.js');
const parameters = ['zap.main'];
const options = {stdio:  ['pipe', 1, 2, 'ipc']};
let child = fork(program, parameters, options);
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



  async broadcast (info: Message) {
    if (this.process) return;

    this.process = true;

    const dbName = 'test';
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(dbName);
    const collection = db.collection(info.name);


    const params = (this.lastTakenId) ? {"_id" : { "$gt" : ObjectId(this.lastTakenId) }} : {"_id" : { "$gte" : ObjectId(info.id) }};
    const res = await collection.find(params).toArray();
    if(this.observerFunction) this.observerFunction(res);
    this.lastTakenId = res[res.length - 1]._id;
    this.process = false;
  }
  kill() {
      if (child) child.kill();
  }
}
