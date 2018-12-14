/* first run:
shell mongodoki start -n test
node
const Mongodoki = require('mongodoki').Mongodoki;
const md = new Mongodoki();
await db = md.getDb('test');
*/

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = 'mongodb://localhost:27017';
declare var process: any;
/*async function updateResponseData(state: any, payload: any, blockInfo: any, context: any) {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db("test");
    const collection = db.collection("query");
    await collection.update({id: payload.data.id}, {"answered": true});
  } catch(e) {console.log(e);}
  updateTransferData(state, payload, blockInfo, context);
}*/
/*async function updateQueryData(state: any, payload: any, blockInfo: any, context: any) {
  //collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 3600 });

  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db("test");
    const collection = db.collection(payload.name);
    const s = await collection.insertOne({
      transactionId: payload.transactionId,
      actionIndex: payload.actionIndex,
      account: payload.account,
      name: payload.name,
      authorization: payload.authorization,
      data: payload.data,
      createdAt: new Date(),
      answered: false,
    });
    process.send({id: s.insertedId, account: payload.account, name: payload.name});
  } catch(e) {console.log(e);}
}*/

async function updateTransferData(state: any, payload: any, blockInfo: any, context: any) {
  //collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 3600 });
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db("test");
    const collection = db.collection(payload.name);
    const s = await collection.insertOne({
      transactionId: payload.transactionId,
      actionIndex: payload.actionIndex,
      account: payload.account,
      name: payload.name,
      authorization: payload.authorization,
      data: payload.data,
      createdAt: Date.now(),
      answered: false,
    });
    process.send({id: s.insertedId, account: payload.account, name: payload.name});
  } catch(e) {console.log(e);}
}
const account = process.argv[2];
export const updaters = [
  {
    actionType: `${account}::addendpoint`,
    updater: updateTransferData,
  },
  {
    actionType: `${account}::newprovider`,
    updater: updateTransferData,
  },
  {
    actionType: `${account}::bond`,
    updater: updateTransferData,
  },
  {
    actionType: `${account}::unbond`,
    updater: updateTransferData,
  },
  {
    actionType: `${account}::estimate`,
    updater: updateTransferData,
  },
  {
    actionType: `${account}::query`,
    updater: updateTransferData,
  },
  {
    actionType: `${account}::cancelquery`,
    updater: updateTransferData,
  },
  {
    actionType: `${account}::respond`,
    updater: updateTransferData,
  },
  {
    actionType: `${account}::subscribe`,
    updater: updateTransferData,
  },
  {
    actionType: `${account}::unsubscribe`,
    updater: updateTransferData,
  }

];
