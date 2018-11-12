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
        console.log(yield bondage.bond('zap.provider', 'test_endpoint', 1)); //Action validate exception при этом у user, который subscriber  - "accounts":[{"permission":{"actor":"zap.main","permission":"eosio.code"},"weight":1}],
        const holders = yield bondage.queryHolders(0, 10, 10);
        console.log(yield eos.getAccount('user'));
        const issued = yield bondage.queryIssued(0, 10, 10);
        console.log(holders, issued);
        yield expect(issued.rows[0].dots).to.be.equal(1);
        yield dispatch.query(node.getAccounts().account_provider.name, 'test_endpoint', 'test_query', false);
        //await expect(holders.rows[0].dots).to.be.equal(1);
        let qdata = yield getRowsByPrimaryKey(eos, node, node.zap.name, 'qdata', 'id');
        let holder = yield getRowsByPrimaryKey(eos, node, node.zap.name, 'holder', 'provider');
        yield expect(qdata.rows[0].data).to.be.equal('test_query');
        yield expect(holder.rows[0].escrow).to.be.equal(1);
        yield expect(holder.rows[0].dots).to.be.equal(0);
    }));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvYm9uZGFnZS9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQzdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QiwrQ0FBaUQ7QUFDakQsbUNBQW9DO0FBRXBDLCtDQUFnRDtBQUVoRCwrQ0FBK0M7QUFDL0MsMERBQTREO0FBSzVELDhCQUFvQyxJQUFjOztRQUM5QyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVELFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ2xCLE1BQU0sSUFBSSxHQUFJLElBQUksc0JBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDOUQsSUFBSSxRQUFhLENBQUM7SUFDbEIsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSSxHQUFRLENBQUM7SUFDYixJQUFJLFFBQWtCLENBQUM7SUFDdkIsNkJBQW1DLEdBQVEsRUFBRSxJQUFTLEVBQUUsS0FBYSxFQUFFLFVBQWtCLEVBQUUsU0FBaUI7O1lBQ3hHLE9BQU8sTUFBTSxHQUFHLENBQUMsWUFBWSxDQUN6QixJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxF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RSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMzRCxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFLbkQsQ0FBQyxDQUFBLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhwZWN0ID0gcmVxdWlyZSgnY2hhaScpXG4udXNlKHJlcXVpcmUoJ2NoYWktYXMtcHJvbWlzZWQnKSlcbi51c2UocmVxdWlyZSgnY2hhaS1iaWdudW1iZXInKSlcbi5leHBlY3Q7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHsgUmVnc2l0cnkgfSBmcm9tIFwiLi4vLi4vLi4vcmVnaXN0cnkvb3V0XCI7XG5pbXBvcnQgeyBCb25kYWdlIH0gZnJvbSBcIi4uLy4uL3NyY1wiO1xuaW1wb3J0IHsgQWNjb3VudCwgRGVwbG95ZXIgfSBmcm9tICdAemFwanMvZW9zLXV0aWxzJztcbmltcG9ydCB7IFRlc3ROb2RlIGFzIE5vZGV9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSBcIkB6YXBqcy9lb3MtdXRpbHNcIjtcbmltcG9ydCB7RGlzcGF0Y2h9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaC9vdXRcIjtcbmltcG9ydCB7IHRva2VuTWludGluZyB9IGZyb20gXCIuLi8uLi8uLi9taW50aW5nL291dC9taW50aW5nXCI7XG5cblxuXG5cbmFzeW5jIGZ1bmN0aW9uIGNvbmZpZ3VyZUVudmlyb25tZW50KGZ1bmM6IEZ1bmN0aW9uKSB7XG4gICAgYXdhaXQgZnVuYygpO1xufVxuXG5kZXNjcmliZSgnVGVzdCcsICgpID0+IHtcbiAgICBjb25zdCBub2RlID0gIG5ldyBOb2RlKGZhbHNlLCBmYWxzZSwgJ2h0dHA6Ly8xMjcuMC4wLjE6ODg4OCcpO1xuICAgIGxldCByZWdpc3RyeTogYW55O1xuICAgIGxldCBib25kYWdlOiBhbnk7XG4gICAgbGV0IG1pbnRpbmc6IGFueTtcbiAgICBsZXQgZW9zOiBhbnk7XG4gICAgbGV0IGRpc3BhdGNoOiBEaXNwYXRjaDtcbiAgICBhc3luYyBmdW5jdGlvbiBnZXRSb3dzQnlQcmltYXJ5S2V5KGVvczogYW55LCBub2RlOiBhbnksIHNjb3BlOiBzdHJpbmcsIHRhYmxlX25hbWU6IHN0cmluZywgdGFibGVfa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGVvcy5nZXRUYWJsZVJvd3MoXG4gICAgICAgICAgICB0cnVlLCAvLyBqc29uXG4gICAgICAgICAgICBub2RlLnphcC5uYW1lLCAvLyBjb2RlXG4gICAgICAgICAgICBzY29wZSwgLy8gc2NvcGVcbiAgICAgICAgICAgIHRhYmxlX25hbWUsIC8vIHRhYmxlIG5hbWVcbiAgICAgICAgICAgIHRhYmxlX2tleSwgLy8gdGFibGVfa2V5XG4gICAgICAgICAgICAwLCAvLyBsb3dlcl9ib3VuZFxuICAgICAgICAgICAgLTEsIC8vIHVwcGVyX2JvdW5kXG4gICAgICAgICAgICAxMCwgLy8gbGltaXRcbiAgICAgICAgICAgICdpNjQnLCAvLyBrZXlfdHlwZVxuICAgICAgICAgICAgMSAvLyBpbmRleCBwb3NpdGlvblxuICAgICAgICApO1xuICAgIH1cbiAgICBiZWZvcmUoZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdGhpcy50aW1lb3V0KDMwMDAwKTtcbiAgICAgICAgY29uZmlndXJlRW52aXJvbm1lbnQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBlb3MgPSBhd2FpdCBub2RlLmluaXQoKTtcbiAgICAgICAgICAgICAgICByZWdpc3RyeSA9IGF3YWl0IG5ldyBSZWdzaXRyeSh7XG4gICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldEFjY291bnRzKCkuYWNjb3VudF9wcm92aWRlcixcbiAgICAgICAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBib25kYWdlID0gYXdhaXQgbmV3IEJvbmRhZ2Uoe1xuICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfdXNlcixcbiAgICAgICAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtaW50aW5nID0gYXdhaXQgbmV3IHRva2VuTWludGluZyhub2RlLmdldEFjY291bnRzKCkuYWNjb3VudF90b2tlbiwgbm9kZSk7XG4gICAgICAgICAgICAgICAgZGlzcGF0Y2ggPSBuZXcgRGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldEFjY291bnRzKCkuYWNjb3VudF91c2VyLFxuICAgICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7IGNvbnNvbGUubG9nKGUpOyB9XG4gICAgICAgIGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnI2JvbmQoKScsIGFzeW5jKCkgPT4ge1xuICAgICAgY29uc3QgZW9zID0gYXdhaXQgbm9kZS5jb25uZWN0KCk7XG5cbiAgICAgIGF3YWl0IHJlZ2lzdHJ5LmluaXRpYXRlUHJvdmlkZXIoJ29yYWNsZScsIDEwKTtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJlZ2lzdHJ5LnF1ZXJ5UHJvdmlkZXJMaXN0KDAsIC0xLCAxMCk7XG4gICAgICBhd2FpdCBleHBlY3QocmVzLnJvd3NbMF0udGl0bGUpLnRvLmJlLmVxdWFsKCdvcmFjbGUnKTtcbiAgICAgIGF3YWl0IHJlZ2lzdHJ5LmFkZEVuZHBvaW50KCd0ZXN0X2VuZHBvaW50JywgWzMsIDAsIDAsIDIsIDEwMDAwXSwgJycpO1xuICAgICAgY29uc3QgcmVzMiA9IGF3YWl0IHJlZ2lzdHJ5LnF1ZXJ5UHJvdmlkZXJFbmRwb2ludHMoMCwgLTEsIDEwKTtcbiAgICAgIGF3YWl0IGV4cGVjdChyZXMyLnJvd3NbMF0uc3BlY2lmaWVyKS50by5iZS5lcXVhbCgndGVzdF9lbmRwb2ludCcpO1xuICAgICAgYXdhaXQgbWludGluZy5pc3N1ZVRva2Vucyhbe2lkOiBub2RlLmdldEFjY291bnRzKCkuYWNjb3VudF91c2VyLm5hbWUsIHF1YW50aXR5OiAnMTAwMDAwIFRTVCd9XSwgJ2hpJyk7XG4gICAgICBjb25zb2xlLmxvZyhhd2FpdCBib25kYWdlLmJvbmQoJ3phcC5wcm92aWRlcicsICd0ZXN0X2VuZHBvaW50JywgMSkpOy8vQWN0aW9uIHZhbGlkYXRlIGV4Y2VwdGlvbiDQv9GA0Lgg0Y3RgtC+0Lwg0YMgdXNlciwg0LrQvtGC0L7RgNGL0Lkgc3Vic2NyaWJlciAgLSBcImFjY291bnRzXCI6W3tcInBlcm1pc3Npb25cIjp7XCJhY3RvclwiOlwiemFwLm1haW5cIixcInBlcm1pc3Npb25cIjpcImVvc2lvLmNvZGVcIn0sXCJ3ZWlnaHRcIjoxfV0sXG4gICAgICBjb25zdCBob2xkZXJzID0gYXdhaXQgYm9uZGFnZS5xdWVyeUhvbGRlcnMoMCwgMTAsIDEwKTtcbiAgICAgIGNvbnNvbGUubG9nKGF3YWl0IGVvcy5nZXRBY2NvdW50KCd1c2VyJykpO1xuICAgICAgY29uc3QgaXNzdWVkID0gYXdhaXQgYm9uZGFnZS5xdWVyeUlzc3VlZCgwLCAxMCwgMTApO1xuICAgICAgY29uc29sZS5sb2coaG9sZGVycywgaXNzdWVkKTtcbiAgICAgIGF3YWl0IGV4cGVjdChpc3N1ZWQucm93c1swXS5kb3RzKS50by5iZS5lcXVhbCgxKTtcbiAgICAgIGF3YWl0IGRpc3BhdGNoLnF1ZXJ5KG5vZGUuZ2V0QWNjb3VudHMoKS5hY2NvdW50X3Byb3ZpZGVyLm5hbWUsICd0ZXN0X2VuZHBvaW50JywgJ3Rlc3RfcXVlcnknLCBmYWxzZSk7XG4gICAgICAvL2F3YWl0IGV4cGVjdChob2xkZXJzLnJvd3NbMF0uZG90cykudG8uYmUuZXF1YWwoMSk7XG4gICAgICBsZXQgcWRhdGEgPSBhd2FpdCBnZXRSb3dzQnlQcmltYXJ5S2V5KGVvcywgbm9kZSwgbm9kZS56YXAubmFtZSwgJ3FkYXRhJywgJ2lkJyk7XG4gICAgICBsZXQgaG9sZGVyID0gYXdhaXQgZ2V0Um93c0J5UHJpbWFyeUtleShlb3MsIG5vZGUsIG5vZGUuemFwLm5hbWUsICdob2xkZXInLCAncHJvdmlkZXInKTtcblxuICAgICAgYXdhaXQgZXhwZWN0KHFkYXRhLnJvd3NbMF0uZGF0YSkudG8uYmUuZXF1YWwoJ3Rlc3RfcXVlcnknKTtcbiAgICAgIGF3YWl0IGV4cGVjdChob2xkZXIucm93c1swXS5lc2Nyb3cpLnRvLmJlLmVxdWFsKDEpO1xuICAgICAgYXdhaXQgZXhwZWN0KGhvbGRlci5yb3dzWzBdLmRvdHMpLnRvLmJlLmVxdWFsKDApO1xuXG5cblxuXG4gICAgfSlcbn0pO1xuIl19