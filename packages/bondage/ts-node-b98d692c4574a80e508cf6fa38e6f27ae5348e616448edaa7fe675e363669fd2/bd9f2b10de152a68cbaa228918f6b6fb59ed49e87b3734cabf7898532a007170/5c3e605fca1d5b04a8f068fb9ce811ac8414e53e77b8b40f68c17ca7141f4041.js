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
const out_1 = require("../../../registry/out");
const src_1 = require("../../src");
const environment_1 = require("./environment");
const out_2 = require("../../../dispatch/out");
const minting_1 = require("../../../minting/out/minting");
function configureEnvironment(func) {
    return __awaiter(this, void 0, void 0, function* () {
        yield func();
    });
}
describe('Test', () => {
    const node = new environment_1.TestNode(false, false, 'http://127.0.0.1:8888');
    let registry;
    let bondage;
    let minting;
    let eos;
    let dispatch;
    function getRowsByPrimaryKey(eos, node, scope, table_name, table_key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield eos.getTableRows(true, // json
            node.zap.name, // code
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
    before(function (done) {
        this.timeout(30000);
        configureEnvironment(() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield node.restart();
                eos = yield node.init();
                registry = yield new out_1.Regsitry({
                    account: node.getAccounts().account_provider,
                    node
                });
                bondage = yield new src_1.Bondage({
                    account: node.getAccounts().account_user,
                    node
                });
                minting = yield new minting_1.tokenMinting(node.getAccounts().account_token, node);
                dispatch = new out_2.Dispatch({
                    account: node.getAccounts().account_user,
                    node
                });
            }
            catch (e) {
                console.log(e);
            }
            done();
        }));
    });
    it('#bond()', () => __awaiter(this, void 0, void 0, function* () {
        const eos = yield node.connect();
        yield registry.initiateProvider('oracle', 10);
        const res = yield registry.queryProviderList(0, -1, 10);
        yield expect(res.rows[0].title).to.be.equal('oracle');
        yield registry.addEndpoint('test_endpoint', [3, 0, 0, 2, 10000], '');
        const res2 = yield registry.queryProviderEndpoints(0, -1, 10);
        yield expect(res2.rows[0].specifier).to.be.equal('test_endpoint');
        yield minting.issueTokens([{ id: node.getAccounts().account_user.name, quantity: '100000 TST' }], 'hi');
        yield bondage.bond('zap.provider', 'test_endpoint', 1); //Action validate exception при этом у user, который subscriber  - "accounts":[{"permission":{"actor":"zap.main","permission":"eosio.code"},"weight":1}],
        const holders = yield bondage.queryHolders(0, 10, 10);
        const issued = yield bondage.queryIssued(0, 10, 10);
        yield expect(issued.rows[0].dots).to.be.equal(1);
        yield dispatch.query(node.getAccounts().account_provider.name, 'test_endpoint', 'test_query', false);
        console.log(yield getRowsByPrimaryKey(eos, node, node.zap.name, 'qdata', 'id'));
        console.log(yield getRowsByPrimaryKey(eos, node, node.zap.name, 'holder', 'provider'));
        //await expect(qdata.rows[0].data).to.be.equal('test_query');
        //await expect(holder.rows[0].escrow).to.be.equal(1);
        //await expect(holder.rows[0].dots).to.be.equal(0);
    }));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvYm9uZGFnZS9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQzdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QiwrQ0FBaUQ7QUFDakQsbUNBQW9DO0FBRXBDLCtDQUFnRDtBQUVoRCwrQ0FBK0M7QUFDL0MsMERBQTREO0FBSzVELDhCQUFvQyxJQUFjOztRQUM5QyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVELFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ2xCLE1BQU0sSUFBSSxHQUFJLElBQUksc0JBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDOUQsSUFBSSxRQUFhLENBQUM7SUFDbEIsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSSxHQUFRLENBQUM7SUFDYixJQUFJLFFBQWtCLENBQUM7SUFDdkIsNkJBQW1DLEdBQVEsRUFBRSxJQUFTLEVBQUUsS0FBYSxFQUFFLFVBQWtCLEVBQUUsU0FBaUI7O1lBQ3hHLE9BQU8sTUFBTSxHQUFHLENBQUMsWUFBWSxDQUN6QixJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxF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RSxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQSx5SkFBeUo7UUFDaE4sTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEQsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRCxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JHLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBRXZGLDZEQUE2RDtRQUM3RCxxREFBcUQ7UUFDckQsbURBQW1EO0lBS3JELENBQUMsQ0FBQSxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGV4cGVjdCA9IHJlcXVpcmUoJ2NoYWknKVxuLnVzZShyZXF1aXJlKCdjaGFpLWFzLXByb21pc2VkJykpXG4udXNlKHJlcXVpcmUoJ2NoYWktYmlnbnVtYmVyJykpXG4uZXhwZWN0O1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCB7IFJlZ3NpdHJ5IH0gZnJvbSBcIi4uLy4uLy4uL3JlZ2lzdHJ5L291dFwiO1xuaW1wb3J0IHsgQm9uZGFnZSB9IGZyb20gXCIuLi8uLi9zcmNcIjtcbmltcG9ydCB7IEFjY291bnQsIERlcGxveWVyIH0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQgeyBUZXN0Tm9kZSBhcyBOb2RlfSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gXCJAemFwanMvZW9zLXV0aWxzXCI7XG5pbXBvcnQge0Rpc3BhdGNofSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2gvb3V0XCI7XG5pbXBvcnQgeyB0b2tlbk1pbnRpbmcgfSBmcm9tIFwiLi4vLi4vLi4vbWludGluZy9vdXQvbWludGluZ1wiO1xuXG5cblxuXG5hc3luYyBmdW5jdGlvbiBjb25maWd1cmVFbnZpcm9ubWVudChmdW5jOiBGdW5jdGlvbikge1xuICAgIGF3YWl0IGZ1bmMoKTtcbn1cblxuZGVzY3JpYmUoJ1Rlc3QnLCAoKSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9ICBuZXcgTm9kZShmYWxzZSwgZmFsc2UsICdodHRwOi8vMTI3LjAuMC4xOjg4ODgnKTtcbiAgICBsZXQgcmVnaXN0cnk6IGFueTtcbiAgICBsZXQgYm9uZGFnZTogYW55O1xuICAgIGxldCBtaW50aW5nOiBhbnk7XG4gICAgbGV0IGVvczogYW55O1xuICAgIGxldCBkaXNwYXRjaDogRGlzcGF0Y2g7XG4gICAgYXN5bmMgZnVuY3Rpb24gZ2V0Um93c0J5UHJpbWFyeUtleShlb3M6IGFueSwgbm9kZTogYW55LCBzY29wZTogc3RyaW5nLCB0YWJsZV9uYW1lOiBzdHJpbmcsIHRhYmxlX2tleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBlb3MuZ2V0VGFibGVSb3dzKFxuICAgICAgICAgICAgdHJ1ZSwgLy8ganNvblxuICAgICAgICAgICAgbm9kZS56YXAubmFtZSwgLy8gY29kZVxuICAgICAgICAgICAgc2NvcGUsIC8vIHNjb3BlXG4gICAgICAgICAgICB0YWJsZV9uYW1lLCAvLyB0YWJsZSBuYW1lXG4gICAgICAgICAgICB0YWJsZV9rZXksIC8vIHRhYmxlX2tleVxuICAgICAgICAgICAgMCwgLy8gbG93ZXJfYm91bmRcbiAgICAgICAgICAgIC0xLCAvLyB1cHBlcl9ib3VuZFxuICAgICAgICAgICAgMTAsIC8vIGxpbWl0XG4gICAgICAgICAgICAnaTY0JywgLy8ga2V5X3R5cGVcbiAgICAgICAgICAgIDEgLy8gaW5kZXggcG9zaXRpb25cbiAgICAgICAgKTtcbiAgICB9XG4gICAgYmVmb3JlKGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHRoaXMudGltZW91dCgzMDAwMCk7XG4gICAgICAgIGNvbmZpZ3VyZUVudmlyb25tZW50KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgZW9zID0gYXdhaXQgbm9kZS5pbml0KCk7XG4gICAgICAgICAgICAgICAgcmVnaXN0cnkgPSBhd2FpdCBuZXcgUmVnc2l0cnkoe1xuICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfcHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYm9uZGFnZSA9IGF3YWl0IG5ldyBCb25kYWdlKHtcbiAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG5vZGUuZ2V0QWNjb3VudHMoKS5hY2NvdW50X3VzZXIsXG4gICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbWludGluZyA9IGF3YWl0IG5ldyB0b2tlbk1pbnRpbmcobm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfdG9rZW4sIG5vZGUpO1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoID0gbmV3IERpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfdXNlcixcbiAgICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmxvZyhlKTsgfVxuICAgICAgICBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJyNib25kKCknLCBhc3luYygpID0+IHtcbiAgICAgIGNvbnN0IGVvcyA9IGF3YWl0IG5vZGUuY29ubmVjdCgpO1xuXG4gICAgICBhd2FpdCByZWdpc3RyeS5pbml0aWF0ZVByb3ZpZGVyKCdvcmFjbGUnLCAxMCk7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCByZWdpc3RyeS5xdWVyeVByb3ZpZGVyTGlzdCgwLCAtMSwgMTApO1xuICAgICAgYXdhaXQgZXhwZWN0KHJlcy5yb3dzWzBdLnRpdGxlKS50by5iZS5lcXVhbCgnb3JhY2xlJyk7XG4gICAgICBhd2FpdCByZWdpc3RyeS5hZGRFbmRwb2ludCgndGVzdF9lbmRwb2ludCcsIFszLCAwLCAwLCAyLCAxMDAwMF0sICcnKTtcbiAgICAgIGNvbnN0IHJlczIgPSBhd2FpdCByZWdpc3RyeS5xdWVyeVByb3ZpZGVyRW5kcG9pbnRzKDAsIC0xLCAxMCk7XG4gICAgICBhd2FpdCBleHBlY3QocmVzMi5yb3dzWzBdLnNwZWNpZmllcikudG8uYmUuZXF1YWwoJ3Rlc3RfZW5kcG9pbnQnKTtcbiAgICAgIGF3YWl0IG1pbnRpbmcuaXNzdWVUb2tlbnMoW3tpZDogbm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfdXNlci5uYW1lLCBxdWFudGl0eTogJzEwMDAwMCBUU1QnfV0sICdoaScpO1xuICAgICAgYXdhaXQgYm9uZGFnZS5ib25kKCd6YXAucHJvdmlkZXInLCAndGVzdF9lbmRwb2ludCcsIDEpOy8vQWN0aW9uIHZhbGlkYXRlIGV4Y2VwdGlvbiDQv9GA0Lgg0Y3RgtC+0Lwg0YMgdXNlciwg0LrQvtGC0L7RgNGL0Lkgc3Vic2NyaWJlciAgLSBcImFjY291bnRzXCI6W3tcInBlcm1pc3Npb25cIjp7XCJhY3RvclwiOlwiemFwLm1haW5cIixcInBlcm1pc3Npb25cIjpcImVvc2lvLmNvZGVcIn0sXCJ3ZWlnaHRcIjoxfV0sXG4gICAgICBjb25zdCBob2xkZXJzID0gYXdhaXQgYm9uZGFnZS5xdWVyeUhvbGRlcnMoMCwgMTAsIDEwKTtcbiAgICAgIGNvbnN0IGlzc3VlZCA9IGF3YWl0IGJvbmRhZ2UucXVlcnlJc3N1ZWQoMCwgMTAsIDEwKTtcbiAgICAgIGF3YWl0IGV4cGVjdChpc3N1ZWQucm93c1swXS5kb3RzKS50by5iZS5lcXVhbCgxKTtcbiAgICAgIGF3YWl0IGRpc3BhdGNoLnF1ZXJ5KG5vZGUuZ2V0QWNjb3VudHMoKS5hY2NvdW50X3Byb3ZpZGVyLm5hbWUsICd0ZXN0X2VuZHBvaW50JywgJ3Rlc3RfcXVlcnknLCBmYWxzZSk7XG4gICAgICBjb25zb2xlLmxvZyhhd2FpdCBnZXRSb3dzQnlQcmltYXJ5S2V5KGVvcywgbm9kZSwgbm9kZS56YXAubmFtZSwgJ3FkYXRhJywgJ2lkJykpO1xuICAgICAgY29uc29sZS5sb2coYXdhaXQgZ2V0Um93c0J5UHJpbWFyeUtleShlb3MsIG5vZGUsIG5vZGUuemFwLm5hbWUsICdob2xkZXInLCAncHJvdmlkZXInKSk7XG5cbiAgICAgIC8vYXdhaXQgZXhwZWN0KHFkYXRhLnJvd3NbMF0uZGF0YSkudG8uYmUuZXF1YWwoJ3Rlc3RfcXVlcnknKTtcbiAgICAgIC8vYXdhaXQgZXhwZWN0KGhvbGRlci5yb3dzWzBdLmVzY3JvdykudG8uYmUuZXF1YWwoMSk7XG4gICAgICAvL2F3YWl0IGV4cGVjdChob2xkZXIucm93c1swXS5kb3RzKS50by5iZS5lcXVhbCgwKTtcblxuXG5cblxuICAgIH0pXG59KTtcbiJdfQ==