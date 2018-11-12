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
const minting_1 = require("@zapjs/minting");
const __1 = require("../");
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
    let minting;
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
                bondage = new __1.Bondage({
                    account: node.getUserAccount(),
                    node
                });
                minting = yield new minting_1.Minting(node.getTokenAccount(), node);
            }
            catch (e) {
                console.log(e);
            }
            done();
        }));
    });
    it('#query()', () => __awaiter(this, void 0, void 0, function* () {
        let eos = yield node.connect();
        yield minting.issueTokens([{ id: node.getUserAccount().name, quantity: '300000 TST' }], 'hi');
        console.log(yield eos.getCurrencyBalance(node.getTokenAccount().name, node.getUserAccount().name, 'TST'));
        yield registry.initiateProvider('tests', 10);
        yield registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
        yield bondage.bond(node.getProviderAccount().name, 'endp', 1);
        let holder = yield getRowsByPrimaryKey(eos, node, node.getUserAccount().name, 'holder', 'provider');
        yield expect(holder.rows[0].dots).to.be.equal(1);
        console.log(yield eos.getCurrencyBalance(node.getTokenAccount().name, node.getUserAccount().name, 'TST'));
    }));
    after(() => {
        node.kill();
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvYm9uZGFnZS9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQ3pCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1osTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixzREFBNkM7QUFDN0MsNENBQXVDO0FBQ3ZDLDJCQUE0QjtBQUM1QiwrQ0FBK0M7QUFJL0MsOEJBQW9DLElBQWM7O1FBQzlDLE1BQU0sSUFBSSxFQUFFLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBRUQsNkJBQW1DLEdBQVEsRUFBRSxJQUFTLEVBQUUsS0FBYSxFQUFFLFVBQWtCLEVBQUUsU0FBaUI7O1FBQ3hHLE9BQU8sTUFBTSxHQUFHLENBQUMsWUFBWSxDQUN6QixJQUFJLEVBQUUsT0FBTztRQUNiLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTztRQUNsQyxLQUFLLEVBQUUsUUFBUTtRQUNmLFVBQVUsRUFBRSxhQUFhO1FBQ3pCLFNBQVMsRUFBRSxZQUFZO1FBQ3ZCLENBQUMsRUFBRSxjQUFjO1FBQ2pCLENBQUMsQ0FBQyxFQUFFLGNBQWM7UUFDbEIsRUFBRSxFQUFFLFFBQVE7UUFDWixLQUFLLEVBQUUsV0FBVztRQUNsQixDQUFDLENBQUMsaUJBQWlCO1NBQ3RCLENBQUM7SUFDTixDQUFDO0NBQUE7QUFFRCxRQUFRLENBQUMs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QyxDQUFDO0lBQzlHLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQ1AsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleHBlY3QgPSByZXF1aXJlKCdjaGFpJylcbiAgICAudXNlKHJlcXVpcmUoJ2NoYWktYXMtcHJvbWlzZWQnKSlcbiAgICAudXNlKHJlcXVpcmUoJ2NoYWktYmlnbnVtYmVyJykpXG4gICAgLmV4cGVjdDtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQge1JlZ3NpdHJ5fSBmcm9tIFwiQHphcGpzL2Vvcy1yZWdpc3RyeVwiO1xuaW1wb3J0IHtNaW50aW5nfSBmcm9tIFwiQHphcGpzL21pbnRpbmdcIjtcbmltcG9ydCB7Qm9uZGFnZX0gZnJvbSBcIi4uL1wiO1xuaW1wb3J0IHtUZXN0Tm9kZSBhcyBOb2RlfSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gXCJAemFwanMvZW9zLXV0aWxzXCI7XG5cblxuYXN5bmMgZnVuY3Rpb24gY29uZmlndXJlRW52aXJvbm1lbnQoZnVuYzogRnVuY3Rpb24pIHtcbiAgICBhd2FpdCBmdW5jKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFJvd3NCeVByaW1hcnlLZXkoZW9zOiBhbnksIG5vZGU6IGFueSwgc2NvcGU6IHN0cmluZywgdGFibGVfbmFtZTogc3RyaW5nLCB0YWJsZV9rZXk6IHN0cmluZykge1xuICAgIHJldHVybiBhd2FpdCBlb3MuZ2V0VGFibGVSb3dzKFxuICAgICAgICB0cnVlLCAvLyBqc29uXG4gICAgICAgIG5vZGUuZ2V0WmFwQWNjb3VudCgpLm5hbWUsIC8vIGNvZGVcbiAgICAgICAgc2NvcGUsIC8vIHNjb3BlXG4gICAgICAgIHRhYmxlX25hbWUsIC8vIHRhYmxlIG5hbWVcbiAgICAgICAgdGFibGVfa2V5LCAvLyB0YWJsZV9rZXlcbiAgICAgICAgMCwgLy8gbG93ZXJfYm91bmRcbiAgICAgICAgLTEsIC8vIHVwcGVyX2JvdW5kXG4gICAgICAgIDEwLCAvLyBsaW1pdFxuICAgICAgICAnaTY0JywgLy8ga2V5X3R5cGVcbiAgICAgICAgMSAvLyBpbmRleCBwb3NpdGlvblxuICAgICk7XG59XG5cbmRlc2NyaWJlKCdUZXN0JywgKCkgPT4ge1xuICAgIGxldCBub2RlOiBhbnk7XG4gICAgbGV0IHJlZ2lzdHJ5OiBSZWdzaXRyeTtcbiAgICBsZXQgYm9uZGFnZTogQm9uZGFnZTtcbiAgICBsZXQgbWludGluZzogTWludGluZztcblxuICAgIGJlZm9yZShmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB0aGlzLnRpbWVvdXQoMzAwMDApO1xuICAgICAgICBjb25maWd1cmVFbnZpcm9ubWVudChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSBuZXcgTm9kZShmYWxzZSwgZmFsc2UsICdodHRwOi8vMTI3LjAuMC4xOjg4ODgnKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLmluaXQoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLmNvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICByZWdpc3RyeSA9IG5ldyBSZWdzaXRyeSh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG5vZGUuZ2V0UHJvdmlkZXJBY2NvdW50KCksXG4gICAgICAgICAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBib25kYWdlID0gbmV3IEJvbmRhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldFVzZXJBY2NvdW50KCksXG4gICAgICAgICAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtaW50aW5nID0gYXdhaXQgbmV3IE1pbnRpbmcobm9kZS5nZXRUb2tlbkFjY291bnQoKSwgbm9kZSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnI3F1ZXJ5KCknLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGxldCBlb3MgPSBhd2FpdCBub2RlLmNvbm5lY3QoKTtcbiAgICAgICAgYXdhaXQgbWludGluZy5pc3N1ZVRva2Vucyhbe2lkOiBub2RlLmdldFVzZXJBY2NvdW50KCkubmFtZSwgcXVhbnRpdHk6ICczMDAwMDAgVFNUJ31dLCAnaGknKTtcbiAgICAgICAgY29uc29sZS5sb2coYXdhaXQgZW9zLmdldEN1cnJlbmN5QmFsYW5jZShub2RlLmdldFRva2VuQWNjb3VudCgpLm5hbWUsIG5vZGUuZ2V0VXNlckFjY291bnQoKS5uYW1lLCAnVFNUJykpO1xuICAgICAgICBhd2FpdCByZWdpc3RyeS5pbml0aWF0ZVByb3ZpZGVyKCd0ZXN0cycsIDEwKTtcbiAgICAgICAgYXdhaXQgcmVnaXN0cnkuYWRkRW5kcG9pbnQoJ2VuZHAnLCBbMywgMCwgMCwgMiwgMTAwMDBdLCAnJyk7XG4gICAgICAgIGF3YWl0IGJvbmRhZ2UuYm9uZChub2RlLmdldFByb3ZpZGVyQWNjb3VudCgpLm5hbWUsICdlbmRwJywgMSk7XG4gICAgICAgIGxldCBob2xkZXIgPSBhd2FpdCBnZXRSb3dzQnlQcmltYXJ5S2V5KGVvcywgbm9kZSwgbm9kZS5nZXRVc2VyQWNjb3VudCgpLm5hbWUsICdob2xkZXInLCAncHJvdmlkZXInKTtcbiAgICAgICAgYXdhaXQgZXhwZWN0KGhvbGRlci5yb3dzWzBdLmRvdHMpLnRvLmJlLmVxdWFsKDEpO1xuICAgICAgICBjb25zb2xlLmxvZyhhd2FpdCBlb3MuZ2V0Q3VycmVuY3lCYWxhbmNlKG5vZGUuZ2V0VG9rZW5BY2NvdW50KCkubmFtZSwgbm9kZS5nZXRVc2VyQWNjb3VudCgpLm5hbWUsICdUU1QnKSk7XG4gICAgfSk7XG5cbiAgICBhZnRlcigoKSA9PiB7XG4gICAgICAgIG5vZGUua2lsbCgpO1xuICAgIH0pXG59KTtcbiJdfQ==