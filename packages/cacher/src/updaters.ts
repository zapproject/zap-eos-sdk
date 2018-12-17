const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = 'mongodb://localhost:27017';
declare var process: any;

async function updateTransferData(state: any, payload: any, blockInfo: any, context: any) {

  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db("local");
    const collection = db.collection(payload.name);
    collection.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 2 * 3600 } )
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
const account = process.argv[3];
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
