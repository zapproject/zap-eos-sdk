"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const path = require('path');
const fs = require('fs');
const eos_registry_1 = require("@zapjs/eos-registry");
const eos_bondage_1 = require("@zapjs/eos-bondage");
const src_1 = require("../../src");
const environment_1 = require("./environment");
function configureEnvironment(func) {
    return __awaiter(this, void 0, void 0, function* () {
        yield func();
    });
}
function getRowsByPrimaryKey(eos, node, scope, table_name, table_key) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield eos.getTableRows(true, // json
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
    });
}
describe('Test', () => {
    let node;
    let registry;
    let bondage;
    let dispatch;
    before(function (done) {
        this.timeout(30000);
        configureEnvironment(() => __awaiter(this, void 0, void 0, function* () {
            try {
                node = new environment_1.TestNode(false, false, 'http://127.0.0.1:8888');
                yield node.restart();
                yield node.init();
                yield node.connect();
                registry = new eos_registry_1.Regsitry({
                    account: node.getProviderAccount(),
                    node
                });
                bondage = new eos_bondage_1.Bondage({
                    account: node.getUserAccount(),
                    node
                });
                dispatch = new src_1.Dispatch({
                    account: node.getUserAccount(),
                    node
                });
            }
            catch (e) {
                console.log(e);
            }
            done();
        }));
    });
    it('#query()', () => __awaiter(this, void 0, void 0, function* () {
        let eos = yield node.connect();
        yield registry.initiateProvider('tests', 10);
        yield registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
        yield bondage.bond(node.getProviderAccount().name, 'endp', 1);
        yield dispatch.query(node.getProviderAccount().name, 'endp', 'test_query', false);
        let qdata = yield getRowsByPrimaryKey(eos, node, node.getZapAccount().name, 'qdata', 'id');
        let holder = yield getRowsByPrimaryKey(eos, node, node.getUserAccount().name, 'holder', 'provider');
        console.log(holder.rows[0]);
        yield expect(qdata.rows[0].data).to.be.equal('test_query');
        yield expect(holder.rows[0].escrow).to.be.equal(1);
        yield expect(holder.rows[0].dots).to.be.equal(0);
    }));
    after(() => {
        node.kill();
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9kaXNwYXRjaC9zcmMvdGVzdC90ZXN0LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL2Rpc3BhdGNoL3NyYy90ZXN0L3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FDekIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ2hDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUM5QixNQUFNLENBQUM7QUFDWixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLHNEQUE2QztBQUM3QyxvREFBMkM7QUFDM0MsbUNBQW1DO0FBQ25DLCtDQUErQztBQUkvQyw4QkFBb0MsSUFBYzs7UUFDOUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztJQUNqQixDQUFDO0NBQUE7QUFFRCw2QkFBbUMsR0FBUSxFQUFFLElBQVMsRUFBRSxLQUFhLEVBQUUsVUFBa0IsRUFBRSxTQUFpQjs7UUFDeEcsT0FBTyxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQ3pCLElBQUksRUFBRSxPQUFPO1FBQ2IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPO1FBQ2xDLEtBQUssRUFBRSxRQUFRO1FBQ2YsVUFBVSxFQUFFLGFBQWE7UUFDekIsU0FBUyxFQUFFLFlBQVk7UUFDdkIsQ0FBQyxFQUFFLGNBQWM7UUFDakIsQ0FBQyxDQUFDLEVBQUUsY0FBYztRQUNsQixFQUFFLEVBQUUsUUFBUTtRQUNaLEtBQUssRUFBRSxXQUFXO1FBQ2xCLENBQUMsQ0FBQyxpQkFBaUI7U0FDdEIsQ0FBQztJQUNOLENBQUM7Q0FBQTtBQUVELFFBQVEsQ0FB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QUFDLENBQUMsQ0FBQztRQUNuRCxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUMsQ0FBQSxDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQ1AsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleHBlY3QgPSByZXF1aXJlKCdjaGFpJylcbiAgICAudXNlKHJlcXVpcmUoJ2NoYWktYXMtcHJvbWlzZWQnKSlcbiAgICAudXNlKHJlcXVpcmUoJ2NoYWktYmlnbnVtYmVyJykpXG4gICAgLmV4cGVjdDtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQge1JlZ3NpdHJ5fSBmcm9tIFwiQHphcGpzL2Vvcy1yZWdpc3RyeVwiO1xuaW1wb3J0IHtCb25kYWdlfSBmcm9tIFwiQHphcGpzL2Vvcy1ib25kYWdlXCI7XG5pbXBvcnQge0Rpc3BhdGNofSBmcm9tIFwiLi4vLi4vc3JjXCI7XG5pbXBvcnQge1Rlc3ROb2RlIGFzIE5vZGV9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSBcIkB6YXBqcy9lb3MtdXRpbHNcIjtcblxuXG5hc3luYyBmdW5jdGlvbiBjb25maWd1cmVFbnZpcm9ubWVudChmdW5jOiBGdW5jdGlvbikge1xuICAgIGF3YWl0IGZ1bmMoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0Um93c0J5UHJpbWFyeUtleShlb3M6IGFueSwgbm9kZTogYW55LCBzY29wZTogc3RyaW5nLCB0YWJsZV9uYW1lOiBzdHJpbmcsIHRhYmxlX2tleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGF3YWl0IGVvcy5nZXRUYWJsZVJvd3MoXG4gICAgICAgIHRydWUsIC8vIGpzb25cbiAgICAgICAgbm9kZS5nZXRaYXBBY2NvdW50KCkubmFtZSwgLy8gY29kZVxuICAgICAgICBzY29wZSwgLy8gc2NvcGVcbiAgICAgICAgdGFibGVfbmFtZSwgLy8gdGFibGUgbmFtZVxuICAgICAgICB0YWJsZV9rZXksIC8vIHRhYmxlX2tleVxuICAgICAgICAwLCAvLyBsb3dlcl9ib3VuZFxuICAgICAgICAtMSwgLy8gdXBwZXJfYm91bmRcbiAgICAgICAgMTAsIC8vIGxpbWl0XG4gICAgICAgICdpNjQnLCAvLyBrZXlfdHlwZVxuICAgICAgICAxIC8vIGluZGV4IHBvc2l0aW9uXG4gICAgKTtcbn1cblxuZGVzY3JpYmUoJ1Rlc3QnLCAoKSA9PiB7XG4gICAgbGV0IG5vZGU6IGFueTtcbiAgICBsZXQgcmVnaXN0cnk6IFJlZ3NpdHJ5O1xuICAgIGxldCBib25kYWdlOiBCb25kYWdlO1xuICAgIGxldCBkaXNwYXRjaDogRGlzcGF0Y2g7XG5cbiAgICBiZWZvcmUoZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdGhpcy50aW1lb3V0KDMwMDAwKTtcbiAgICAgICAgY29uZmlndXJlRW52aXJvbm1lbnQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBub2RlID0gbmV3IE5vZGUoZmFsc2UsIGZhbHNlLCAnaHR0cDovLzEyNy4wLjAuMTo4ODg4Jyk7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5pbml0KCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5jb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgcmVnaXN0cnkgPSBuZXcgUmVnc2l0cnkoe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldFByb3ZpZGVyQWNjb3VudCgpLFxuICAgICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYm9uZGFnZSA9IG5ldyBCb25kYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRVc2VyQWNjb3VudCgpLFxuICAgICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZGlzcGF0Y2ggPSBuZXcgRGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldFVzZXJBY2NvdW50KCksXG4gICAgICAgICAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCcjcXVlcnkoKScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgbGV0IGVvcyA9IGF3YWl0IG5vZGUuY29ubmVjdCgpO1xuICAgICAgICBhd2FpdCByZWdpc3RyeS5pbml0aWF0ZVByb3ZpZGVyKCd0ZXN0cycsIDEwKTtcbiAgICAgICAgYXdhaXQgcmVnaXN0cnkuYWRkRW5kcG9pbnQoJ2VuZHAnLCBbMywgMCwgMCwgMiwgMTAwMDBdLCAnJyk7XG4gICAgICAgIGF3YWl0IGJvbmRhZ2UuYm9uZChub2RlLmdldFByb3ZpZGVyQWNjb3VudCgpLm5hbWUsICdlbmRwJywgMSk7XG4gICAgICAgIGF3YWl0IGRpc3BhdGNoLnF1ZXJ5KG5vZGUuZ2V0UHJvdmlkZXJBY2NvdW50KCkubmFtZSwgJ2VuZHAnLCAndGVzdF9xdWVyeScsIGZhbHNlKTtcblxuICAgICAgICBsZXQgcWRhdGEgPSBhd2FpdCBnZXRSb3dzQnlQcmltYXJ5S2V5KGVvcywgbm9kZSwgbm9kZS5nZXRaYXBBY2NvdW50KCkubmFtZSwgJ3FkYXRhJywgJ2lkJyk7XG4gICAgICAgIGxldCBob2xkZXIgPSBhd2FpdCBnZXRSb3dzQnlQcmltYXJ5S2V5KGVvcywgbm9kZSwgbm9kZS5nZXRVc2VyQWNjb3VudCgpLm5hbWUsICdob2xkZXInLCAncHJvdmlkZXInKTtcbiAgICAgICAgY29uc29sZS5sb2coaG9sZGVyLnJvd3NbMF0pXG5cbiAgICAgICAgYXdhaXQgZXhwZWN0KHFkYXRhLnJvd3NbMF0uZGF0YSkudG8uYmUuZXF1YWwoJ3Rlc3RfcXVlcnknKTtcbiAgICAgICAgYXdhaXQgZXhwZWN0KGhvbGRlci5yb3dzWzBdLmVzY3JvdykudG8uYmUuZXF1YWwoMSk7XG4gICAgICAgIGF3YWl0IGV4cGVjdChob2xkZXIucm93c1swXS5kb3RzKS50by5iZS5lcXVhbCgwKTtcbiAgICB9KTtcblxuICAgIGFmdGVyKCgpID0+IHtcbiAgICAgICAgbm9kZS5raWxsKCk7XG4gICAgfSlcbn0pO1xuIl19