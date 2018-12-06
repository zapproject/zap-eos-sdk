const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
import {Regsitry} from "@zapjs/eos-registry";
import {Bondage} from "@zapjs/eos-bondage";
import {Dispatch} from "../../src";
import {TestNode as Node} from './environment';


async function configureEnvironment(func: Function) {
    await func();
}

async function getRowsByPrimaryKey(eos: any, node: any, scope: string, table_name: string, table_key: string) {
    return await eos.getTableRows(
        true, // json
        node.getZapAccount().name, // code
        scope, // scope
        table_name, // table name
        table_key, // table_key
        0, // lower_bound
        -1, // upper_bound
        10, // limit
        'i64', // key_type
        1 // index position
    );
}

describe('Test', () => {
    let node: any;
    let registry: Regsitry;
    let bondage: Bondage;
    let bondageP: Bondage;
    let dispatch: Dispatch;
    let providerDispatch: Dispatch;

    before(function (done) {
        this.timeout(30000);
        configureEnvironment(async () => {
            try {
                node = new Node(false, false, 'http://127.0.0.1:8888');
                await node.restart();
                await node.init();
                await node.connect();
                registry = new Regsitry({
                    account: node.getProviderAccount(),
                    node
                });

                bondage = new Bondage({
                    account: node.getUserAccount(),
                    node
                });

                dispatch = new Dispatch({
                    account: node.getUserAccount(),
                    node
                });

                providerDispatch = new Dispatch({
                    account: node.getProviderAccount(),
                    node
                });

            } catch (e) {
                console.log(e);
            }
            done();
        });
    });

    it('#query()', async () => {
        await registry.initiateProvider('tests', 10);
        await registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
        await registry.addEndpoint('endp2', [3, 0, 0, 2, 10000], '');
        await bondage.bond(node.getProviderAccount().name, 'endp', 1);
        await bondage.bond(node.getProviderAccount().name, 'endp2', 1);




        await dispatch.query(node.getProviderAccount().name, 'endp', 'test_query', false);


        let eos = await node.connect();
        let qdata = await getRowsByPrimaryKey(eos, node, node.getZapAccount().name, 'qdata', 'id');
        let holder = await getRowsByPrimaryKey(eos, node, node.getUserAccount().name, 'holder', 'provider');

        await expect(qdata.rows[0].data).to.be.equal('test_query');
        await expect(holder.rows[0].escrow).to.be.equal(1);
        await expect(holder.rows[0].dots).to.be.equal(0);
    });

    it('#query() - fail if not enough dots', async () => {
        try {
            await dispatch.query(node.getProviderAccount().name, 'endp', 'test_query', false);
        } catch (e) {
            await expect(e).to.be.not.empty;
        }
    });

    it('#cancelquery()', async () => {
        await dispatch.cancelQuery(0);

        let eos = await node.connect();
        let holder = await getRowsByPrimaryKey(eos, node, node.getUserAccount().name, 'holder', 'provider');

        await expect(holder.rows[0].escrow).to.be.equal(0);
        await expect(holder.rows[0].dots).to.be.equal(1);
    });

    it('#respond()', async () => {
       await dispatch.query(node.getProviderAccount().name, 'endp', 'test_query', false);

        let eos = await node.connect();
        let qdata = await getRowsByPrimaryKey(eos, node, node.getZapAccount().name, 'qdata', 'id');
        let holder = await getRowsByPrimaryKey(eos, node, node.getUserAccount().name, 'holder', 'provider');

        await expect(qdata.rows[0].data).to.be.equal('test_query');
        await expect(holder.rows[0].escrow).to.be.equal(1);
        await expect(holder.rows[0].dots).to.be.equal(0);

        await providerDispatch.respond(qdata.rows[0].id, '{p1: 1, p2: 2}');
    });


   after(() => {
        node.kill();
    })
});
describe('Test-listeners', () => {
    let node: any;
    let registry: Regsitry;
    let bondage: Bondage;
    let dispatch: Dispatch;
    let providerDispatch: Dispatch;
    let queryIsMade: boolean = false;

    before(function (done) {
        this.timeout(30000);
        configureEnvironment(async () => {
            try {
                node = new Node(false, false, 'http://127.0.0.1:8888');
                await node.restart();
                await node.init();
                await node.connect();
                registry = new Regsitry({
                    account: node.getProviderAccount(),
                    node
                });
                bondage = new Bondage({
                    account: node.getUserAccount(),
                    node
                });
                dispatch = new Dispatch({
                    account: node.getUserAccount(),
                    node
                });

                providerDispatch = new Dispatch({
                    account: node.getProviderAccount(),
                    node
                });

            } catch (e) {
                console.log(e);
            }
            done();
        });
    });

    it('#listenQueries()', done => {
        dispatch.listenQueries(async (data: any) => {
            if (queryIsMade) return;
            try {
                await expect(data[0].data.query).to.be.equal('test_query');
                queryIsMade = true;
                done();
            }catch(err){done (err)}
        });
        registry.initiateProvider('tests', 10).then(() =>
        registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '')).then(() =>
        bondage.bond(node.getProviderAccount().name, 'endp', 1)).then(() =>
        dispatch.query(node.getProviderAccount().name, 'endp', 'test_query', false));
    });

    it('#listenCancels()', done => {
        dispatch.listenCancels(async (data: any) => {
            try {
                await expect(data[0].name).to.be.equal('cancelquery');
                done();
            }catch(err){done (err)}
        });
        dispatch.cancelQuery(0);
    });

    it('#listenResponses()', done => {
        dispatch.listenResponses(async (data: any) => {
            try {
                await expect(data[0].data.params).to.be.equal('{p1: 1, p2: 2}');
                console.log(JSON.stringify(data));
                done();
            }catch(err){done (err)}
        });
        dispatch.query(node.getProviderAccount().name, 'endp', 'test_query', false).then(() =>
        node.connect()).then( eos =>
        getRowsByPrimaryKey(eos, node, node.getZapAccount().name, 'qdata', 'id')).then(qdata =>
        providerDispatch.respond(qdata.rows[0].id, '{p1: 1, p2: 2}'));
    });


    after(() => {
        node.kill();
    })
});
