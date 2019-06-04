// const expect = require('chai')
//     .use(require('chai-as-promised'))
//     .use(require('chai-bignumber'))
//     .expect;
// import { Provider } from "@zapjs/eos-provider";
// import { Subscriber } from "../../src";
// import { TestNode as Node } from './environment';
//
//
// async function configureEnvironment(func: Function) {
//     await func();
// }
//
//
// describe('Test', () => {
//     let node: any;
//     let subscriber: Subscriber;
//     let provider: Provider;
//
//     before(function (done) {
//         this.timeout(30000);
//         configureEnvironment(async () => {
//             try {
//                 node = new Node(false, false, 'http://127.0.0.1:8888');
//                 await node.restart();
//                 await node.init();
//                 await node.connect();
//                 provider = new Provider({
//                     account: node.getProviderAccount(),
//                     node
//                 });
//                 subscriber  = new Subscriber({
//                     account: node.getUserAccount(),
//                     node
//                 });
//             } catch (e) {
//                 console.log(e);
//             }
//             done();
//         });
//     });
//
//     it('#registry()', async () => {
//         await provider.initiateProvider('tests', 10);
//         await provider.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
//         const resProviders = await provider.queryProviderList(0, -1, 10);
//         await expect(resProviders.rows[0].title).to.be.equal('tests');
//         const resEndpoints = await provider.queryProviderEndpoints(0, -1, 10);
//         await expect(resEndpoints.rows[0].specifier).to.be.equal('endp');
//     });
//
//     it('#bond()', async () => {
//         await subscriber.bond(node.getProviderAccount().name, 'endp', 9);
//         const issued = await provider.queryIssued(0, 1, 1);
//         const holders = await subscriber.queryHolders(0, -1, 10);
//         await expect(issued.rows[0].dots).to.be.equal(9);
//         await expect(holders.rows[0].dots).to.be.equal(9);
//     });
//
//     it('#subscribe()', async () => {
//         await subscriber.subscribe(node.getProviderAccount().name, 'endp', 3, '{p: 1}');
//         let res = await provider.querySubscriptions(0, 10, 10);
//         await expect(res.rows[0].price).to.be.equal(3);
//         await expect(res.rows[0].subscriber).to.be.equal(node.getUserAccount().name);
//     });
//
//     it('#unsubscribeSubscriber()', async () => {
//         await subscriber.unsubscribe(node.getProviderAccount().name, 'endp');
//         let res = await provider.querySubscriptions(0, 10, 10);
//         await expect(res.rows.length).to.be.equal(0);
//     });
//
//     it('#unsubscribeProvider()', async () => {
//         await subscriber.subscribe(node.getProviderAccount().name, 'endp', 2, '{p: 2}');
//         await provider.unsubscribeProvider(node.getUserAccount().name, 'endp');
//         let res = await provider.querySubscriptions(0, 10, 10);
//         await expect(res.rows.length).to.be.equal(0);
//     });
//
//     it('#query()', async () => {
//       await subscriber.query(node.getProviderAccount().name, 'endp', 'test_query', false, Date.now());
//       let qdata = await provider.queryQueriesInfo(0, -1 , 10, 1);
//       let holder = await subscriber.queryHolders(0, -1, 10);
//       await expect(qdata.rows[0].data).to.be.equal('test_query');
//       await expect(holder.rows[0].escrow).to.be.equal(4);
//       await expect(holder.rows[0].dots).to.be.equal(3);
//     });
// //
//     it('#cancelquery()', async () => {
//         await subscriber.cancelQuery(0);
//         let holder = await subscriber.queryHolders(0, -1, 10);
//         await expect(holder.rows[0].escrow).to.be.equal(3);
//         await expect(holder.rows[0].dots).to.be.equal(4);
//     });
//
//     it('#respond()', async () => {
//       await subscriber.query(node.getProviderAccount().name, 'endp', 'test_query2', false, Date.now());
//       let qdata = await provider.queryQueriesInfo(0, -1 , 10, 1);
//       await provider.respond(qdata.rows[0].id, '{p1: 1, p2: 2}', qdata.rows[0].subscriber);
//     });
//
//     it('#unbond()', async () => {
//         await subscriber.unbond(node.getProviderAccount().name, 'endp', 3);
//         const issued = await provider.queryIssued(0, 1, 1);
//         const holders = await subscriber.queryHolders(0, -1, 10);
//         await expect(issued.rows[0].dots).to.be.equal(3);
//         await expect(holders.rows[0].dots).to.be.equal(0);
//     });
//
//     after(() => {
//         node.kill();
//     })
// });
