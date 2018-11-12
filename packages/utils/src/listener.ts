const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';
const fork = require('child_process').fork;
const program = path.resolve(__dirname,'..', '..', '..', 'packages/cacher/out/index.js');
const parameters = ['zap.main'];
const options = {stdio:  ['pipe', 1, 2, 'ipc']};
const child = fork(program, parameters, options);



export class EventObserver {
  takenId: any;
  process: boolean;
  observer: any;
  incoming: any;
  constructor () {
    this.takenId = [];
    this.process = false;
    this.observer = [];
    this.incoming = [];

  }

  on (action: string, fn: Function) {
    if(!this.observer[action]) this.observer[action] = [];
    this.observer[action].push(fn);
    child.on('message', (message: any) =>  this.broadcast({...message}));
  }


  async broadcast (info: {name: string, id: string, account: string}, recurse?: any) {
    this.incoming[info.name] = info;
    if (this.takenId[info.name] && ObjectId(this.incoming[info.name].id) < ObjectId(this.takenId[info.name])) return;
    if (this.process) return;

    this.process = true;

    const dbName = 'test';
    // const db = await md.getDB('test');
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(dbName);
    const collection = db.collection(info.name);


    const params = (recurse) ? {"_id" : { "$gt" : ObjectId(info.id) }} : {"_id" : { "$gte" : ObjectId(info.id) }};
    const res = await collection.find(params).toArray();
    if(this.observer[`${info.account}::${info.name}`])
    this.observer[`${info.account}::${info.name}`].forEach((action: any) => action(res));
    this.takenId[info.name] = res[res.length - 1]._id;
    if (ObjectId(this.incoming[info.name].id) > ObjectId(this.takenId[info.name])) this.broadcast({id: this.takenId[info.name], name: info.name, account: info.account}, true);
    this.process = false;
  }
}
