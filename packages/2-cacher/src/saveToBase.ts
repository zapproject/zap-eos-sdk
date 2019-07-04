const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = "mongodb://172.17.0.2:27017";
declare const process: any;

export async function updateTransferData(state: any, payload: any, blockInfo: any, context: any) {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db("local");
    const collection = db.collection(payload.name);
    collection.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 24 * 3600 * parseInt(process.argv[4])} )
    const s = await collection.insertOne({
      transactionId: payload.transactionId,
      account: payload.account,
      name: payload.name,
      authorization: payload.authorization,
      data: payload.data,
      createdAt: Date.now(),
    });
    process.send({id: s.insertedId, account: payload.account, name: payload.name});
  } catch(e) {console.log(e);}
}