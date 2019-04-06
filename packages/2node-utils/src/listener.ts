const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb://172.17.0.2:27017';
const fork = require('child_process').fork;
const program = path.resolve(__dirname,'../node_modules/.bin/listen-eos');
const options = {stdio:  ['pipe', 1, 2, 'ipc']};
let child: any;
const events = require('events');
const eosActionsEventEmitter = new events.EventEmitter();
import {Message} from "./types/types";


export class EventObserver {
  lastTakenId: any;
  process: boolean;
  observerFunction: Function | undefined;
  incoming: any;
  intervalId: any;
  action: any;

  constructor () {
    this.lastTakenId = null;
    this.process = false;
    this.incoming = null;
  }

  newIncoming(message: any) {
    if (this.action !== `${message.account}::${message.name}`) return;
    this.incoming = {...message};
  };

  on (action: string, fn?: Function) {
    this.observerFunction = fn;
    this.action = action;
    eosActionsEventEmitter.addListener('message', this.newIncoming);

    this.intervalId = setInterval(() => {
      if((this.incoming && !this.lastTakenId) ||
      (this.incoming && ObjectId(this.incoming.id) > ObjectId(this.lastTakenId))) this.broadcast(this.incoming);
    },500);
  }

  off() {
    clearInterval(this.intervalId);
    eosActionsEventEmitter.removeListener('message', this.newIncoming);
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

  static async start(params: [string, string, number]) {
    child = fork(program, params, options);
    child.on('message', (message: any) => eosActionsEventEmitter.emit("message", message));
    console.log("api server started")
  }
}
