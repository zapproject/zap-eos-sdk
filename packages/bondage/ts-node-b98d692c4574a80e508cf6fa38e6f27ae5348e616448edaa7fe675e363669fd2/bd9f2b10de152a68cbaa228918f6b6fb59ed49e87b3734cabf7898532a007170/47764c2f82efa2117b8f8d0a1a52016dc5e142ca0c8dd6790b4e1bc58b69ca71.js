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
        console.log(yield eos.getCurrencyBalance('zap.token', 'zap.user', 'TST'));
        yield bondage.bond(node.getAccounts().account_provider.name, 'test_endpoint', 3); //Action validate exception при этом у user, который subscriber  - "accounts":[{"permission":{"actor":"zap.main","permission":"eosio.code"},"weight":1}],
        console.log(yield eos.getCurrencyBalance('zap.token', 'zap.user', 'TST'));
        const holders = yield bondage.queryHolders(0, 10, 10);
        const issued = yield bondage.queryIssued(0, 10, 10);
        console.log(holders, issued);
        yield expect(issued.rows[0].dots).to.be.equal(3);
        yield dispatch.query(node.getAccounts().account_provider.name, 'test_endpoint', 'test_query', false);
        //await expect(holders.rows[0].dots).to.be.equal(1);
    }));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvYm9uZGFnZS9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQzdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QiwrQ0FBaUQ7QUFDakQsbUNBQW9DO0FBRXBDLCtDQUFnRDtBQUVoRCwrQ0FBK0M7QUFDL0MsMERBQTREO0FBSzVELDhCQUFvQyxJQUFjOztRQUM5QyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVELFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ2xCLE1BQU0sSUFBSSxHQUFJLElBQUksc0JBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDOUQsSUFBSSxRQUFhLENBQUM7SUFDbEIsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSSxHQUFRLENBQUM7SUFDYixJQUFJLFFBQWtCLENBQUM7SUFDdkIsTUFBTSxDQUFDLFVBQVUsSUFBSTtRQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLG9CQUFvQixDQUFDLEdBQVMsRUFBRTtZQUM1QixJQUFJO2dCQUNBLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dC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QU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakQsTUFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRyxvREFBb0Q7SUFLdEQsQ0FBQyxDQUFBLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhwZWN0ID0gcmVxdWlyZSgnY2hhaScpXG4udXNlKHJlcXVpcmUoJ2NoYWktYXMtcHJvbWlzZWQnKSlcbi51c2UocmVxdWlyZSgnY2hhaS1iaWdudW1iZXInKSlcbi5leHBlY3Q7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHsgUmVnc2l0cnkgfSBmcm9tIFwiLi4vLi4vLi4vcmVnaXN0cnkvb3V0XCI7XG5pbXBvcnQgeyBCb25kYWdlIH0gZnJvbSBcIi4uLy4uL3NyY1wiO1xuaW1wb3J0IHsgQWNjb3VudCwgRGVwbG95ZXIgfSBmcm9tICdAemFwanMvZW9zLXV0aWxzJztcbmltcG9ydCB7IFRlc3ROb2RlIGFzIE5vZGV9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSBcIkB6YXBqcy9lb3MtdXRpbHNcIjtcbmltcG9ydCB7RGlzcGF0Y2h9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaC9vdXRcIjtcbmltcG9ydCB7IHRva2VuTWludGluZyB9IGZyb20gXCIuLi8uLi8uLi9taW50aW5nL291dC9taW50aW5nXCI7XG5cblxuXG5cbmFzeW5jIGZ1bmN0aW9uIGNvbmZpZ3VyZUVudmlyb25tZW50KGZ1bmM6IEZ1bmN0aW9uKSB7XG4gICAgYXdhaXQgZnVuYygpO1xufVxuXG5kZXNjcmliZSgnVGVzdCcsICgpID0+IHtcbiAgICBjb25zdCBub2RlID0gIG5ldyBOb2RlKGZhbHNlLCBmYWxzZSwgJ2h0dHA6Ly8xMjcuMC4wLjE6ODg4OCcpO1xuICAgIGxldCByZWdpc3RyeTogYW55O1xuICAgIGxldCBib25kYWdlOiBhbnk7XG4gICAgbGV0IG1pbnRpbmc6IGFueTtcbiAgICBsZXQgZW9zOiBhbnk7XG4gICAgbGV0IGRpc3BhdGNoOiBEaXNwYXRjaDtcbiAgICBiZWZvcmUoZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdGhpcy50aW1lb3V0KDMwMDAwKTtcbiAgICAgICAgY29uZmlndXJlRW52aXJvbm1lbnQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBlb3MgPSBhd2FpdCBub2RlLmluaXQoKTtcbiAgICAgICAgICAgICAgICByZWdpc3RyeSA9IGF3YWl0IG5ldyBSZWdzaXRyeSh7XG4gICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldEFjY291bnRzKCkuYWNjb3VudF9wcm92aWRlcixcbiAgICAgICAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBib25kYWdlID0gYXdhaXQgbmV3IEJvbmRhZ2Uoe1xuICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfdXNlcixcbiAgICAgICAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtaW50aW5nID0gYXdhaXQgbmV3IHRva2VuTWludGluZyhub2RlLmdldEFjY291bnRzKCkuYWNjb3VudF90b2tlbiwgbm9kZSk7XG4gICAgICAgICAgICAgICAgZGlzcGF0Y2ggPSBuZXcgRGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldEFjY291bnRzKCkuYWNjb3VudF91c2VyLFxuICAgICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7IGNvbnNvbGUubG9nKGUpOyB9XG4gICAgICAgIGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnI2JvbmQoKScsIGFzeW5jKCkgPT4ge1xuICAgICAgY29uc3QgZW9zID0gYXdhaXQgbm9kZS5jb25uZWN0KCk7XG5cbiAgICAgIGF3YWl0IHJlZ2lzdHJ5LmluaXRpYXRlUHJvdmlkZXIoJ29yYWNsZScsIDEwKTtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJlZ2lzdHJ5LnF1ZXJ5UHJvdmlkZXJMaXN0KDAsIC0xLCAxMCk7XG4gICAgICBhd2FpdCBleHBlY3QocmVzLnJvd3NbMF0udGl0bGUpLnRvLmJlLmVxdWFsKCdvcmFjbGUnKTtcbiAgICAgIGF3YWl0IHJlZ2lzdHJ5LmFkZEVuZHBvaW50KCd0ZXN0X2VuZHBvaW50JywgWzMsIDAsIDAsIDIsIDEwMDAwXSwgJycpO1xuICAgICAgY29uc3QgcmVzMiA9IGF3YWl0IHJlZ2lzdHJ5LnF1ZXJ5UHJvdmlkZXJFbmRwb2ludHMoMCwgLTEsIDEwKTtcbiAgICAgIGF3YWl0IGV4cGVjdChyZXMyLnJvd3NbMF0uc3BlY2lmaWVyKS50by5iZS5lcXVhbCgndGVzdF9lbmRwb2ludCcpO1xuICAgICAgYXdhaXQgbWludGluZy5pc3N1ZVRva2Vucyhbe2lkOiBub2RlLmdldEFjY291bnRzKCkuYWNjb3VudF91c2VyLm5hbWUsIHF1YW50aXR5OiAnMTAwMDAwIFRTVCd9XSwgJ2hpJyk7XG4gICAgICBjb25zb2xlLmxvZyhhd2FpdCBlb3MuZ2V0Q3VycmVuY3lCYWxhbmNlKCd6YXAudG9rZW4nLCAnemFwLnVzZXInLCAnVFNUJykpO1xuICAgICAgYXdhaXQgYm9uZGFnZS5ib25kKG5vZGUuZ2V0QWNjb3VudHMoKS5hY2NvdW50X3Byb3ZpZGVyLm5hbWUsICd0ZXN0X2VuZHBvaW50JywgMyk7Ly9BY3Rpb24gdmFsaWRhdGUgZXhjZXB0aW9uINC/0YDQuCDRjdGC0L7QvCDRgyB1c2VyLCDQutC+0YLQvtGA0YvQuSBzdWJzY3JpYmVyICAtIFwiYWNjb3VudHNcIjpbe1wicGVybWlzc2lvblwiOntcImFjdG9yXCI6XCJ6YXAubWFpblwiLFwicGVybWlzc2lvblwiOlwiZW9zaW8uY29kZVwifSxcIndlaWdodFwiOjF9XSxcbiAgICAgIGNvbnNvbGUubG9nKGF3YWl0IGVvcy5nZXRDdXJyZW5jeUJhbGFuY2UoJ3phcC50b2tlbicsICd6YXAudXNlcicsICdUU1QnKSk7XG4gICAgICBjb25zdCBob2xkZXJzID0gYXdhaXQgYm9uZGFnZS5xdWVyeUhvbGRlcnMoMCwgMTAsIDEwKTtcbiAgICAgIGNvbnN0IGlzc3VlZCA9IGF3YWl0IGJvbmRhZ2UucXVlcnlJc3N1ZWQoMCwgMTAsIDEwKTtcbiAgICAgIGNvbnNvbGUubG9nKGhvbGRlcnMsIGlzc3VlZCk7XG4gICAgICBhd2FpdCBleHBlY3QoaXNzdWVkLnJvd3NbMF0uZG90cykudG8uYmUuZXF1YWwoMyk7XG4gICAgICBhd2FpdCBkaXNwYXRjaC5xdWVyeShub2RlLmdldEFjY291bnRzKCkuYWNjb3VudF9wcm92aWRlci5uYW1lLCAndGVzdF9lbmRwb2ludCcsICd0ZXN0X3F1ZXJ5JywgZmFsc2UpO1xuICAgICAgLy9hd2FpdCBleHBlY3QoaG9sZGVycy5yb3dzWzBdLmRvdHMpLnRvLmJlLmVxdWFsKDEpO1xuXG5cblxuXG4gICAgfSlcbn0pO1xuIl19