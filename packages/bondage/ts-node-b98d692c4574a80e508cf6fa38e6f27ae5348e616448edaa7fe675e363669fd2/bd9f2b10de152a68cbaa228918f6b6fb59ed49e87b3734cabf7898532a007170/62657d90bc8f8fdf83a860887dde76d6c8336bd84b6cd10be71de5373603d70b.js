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
        console.log(yield eos.getCurrencyBalance('zap.token', 'user', 'TST'));
        yield bondage.bond(node.getAccounts().account_provider.name, 'test_endpoint', 1); //Action validate exception при этом у user, который subscriber  - "accounts":[{"permission":{"actor":"zap.main","permission":"eosio.code"},"weight":1}],
        console.log(yield eos.getCurrencyBalance('zap.token', 'user', 'TST'));
        const holders = yield bondage.queryHolders(0, 10, 10);
        const issued = yield bondage.queryIssued(0, 10, 10);
        console.log(holders, issued);
        //await expect(issued.rows[0].dots).to.be.equal(1);
        //await expect(holders.rows[0].dots).to.be.equal(1);
    }));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvYm9uZGFnZS9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQzdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QiwrQ0FBaUQ7QUFDakQsbUNBQW9DO0FBRXBDLCtDQUFnRDtBQUVoRCwwREFBNEQ7QUFLNUQsOEJBQW9DLElBQWM7O1FBQzlDLE1BQU0sSUFBSSxFQUFFLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBRUQsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7SUFDbEIsTUFBTSxJQUFJLEdBQUksSUFBSSxzQkFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUM5RCxJQUFJLFFBQWEsQ0FBQztJQUNsQixJQUFJLE9BQVksQ0FBQztJQUNqQixJQUFJLE9BQVksQ0FBQztJQUNqQixJQUFJLEdBQVEsQ0FBQztJQUNiLE1BQU0sQ0FBQyxVQUFVLElBQUk7UUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQixvQkFBb0IsQ0FBQyxHQUFTLEVBQUU7WUFDNUIsSUFBSTtnQkFDQSxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckIsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUks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RCxvREFBb0Q7SUFHdEQsQ0FBQyxDQUFBLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhwZWN0ID0gcmVxdWlyZSgnY2hhaScpXG4udXNlKHJlcXVpcmUoJ2NoYWktYXMtcHJvbWlzZWQnKSlcbi51c2UocmVxdWlyZSgnY2hhaS1iaWdudW1iZXInKSlcbi5leHBlY3Q7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHsgUmVnc2l0cnkgfSBmcm9tIFwiLi4vLi4vLi4vcmVnaXN0cnkvb3V0XCI7XG5pbXBvcnQgeyBCb25kYWdlIH0gZnJvbSBcIi4uLy4uL3NyY1wiO1xuaW1wb3J0IHsgQWNjb3VudCwgRGVwbG95ZXIgfSBmcm9tICdAemFwanMvZW9zLXV0aWxzJztcbmltcG9ydCB7IFRlc3ROb2RlIGFzIE5vZGV9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSBcIkB6YXBqcy9lb3MtdXRpbHNcIjtcbmltcG9ydCB7IHRva2VuTWludGluZyB9IGZyb20gXCIuLi8uLi8uLi9taW50aW5nL291dC9taW50aW5nXCI7XG5cblxuXG5cbmFzeW5jIGZ1bmN0aW9uIGNvbmZpZ3VyZUVudmlyb25tZW50KGZ1bmM6IEZ1bmN0aW9uKSB7XG4gICAgYXdhaXQgZnVuYygpO1xufVxuXG5kZXNjcmliZSgnVGVzdCcsICgpID0+IHtcbiAgICBjb25zdCBub2RlID0gIG5ldyBOb2RlKGZhbHNlLCBmYWxzZSwgJ2h0dHA6Ly8xMjcuMC4wLjE6ODg4OCcpO1xuICAgIGxldCByZWdpc3RyeTogYW55O1xuICAgIGxldCBib25kYWdlOiBhbnk7XG4gICAgbGV0IG1pbnRpbmc6IGFueTtcbiAgICBsZXQgZW9zOiBhbnk7XG4gICAgYmVmb3JlKGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHRoaXMudGltZW91dCgzMDAwMCk7XG4gICAgICAgIGNvbmZpZ3VyZUVudmlyb25tZW50KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgZW9zID0gYXdhaXQgbm9kZS5pbml0KCk7XG4gICAgICAgICAgICAgICAgcmVnaXN0cnkgPSBhd2FpdCBuZXcgUmVnc2l0cnkoe1xuICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfcHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYm9uZGFnZSA9IGF3YWl0IG5ldyBCb25kYWdlKHtcbiAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG5vZGUuZ2V0QWNjb3VudHMoKS5hY2NvdW50X3VzZXIsXG4gICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbWludGluZyA9IGF3YWl0IG5ldyB0b2tlbk1pbnRpbmcobm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfdG9rZW4sIG5vZGUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmxvZyhlKTsgfVxuICAgICAgICBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJyNib25kKCknLCBhc3luYygpID0+IHtcbiAgICAgIGNvbnN0IGVvcyA9IGF3YWl0IG5vZGUuY29ubmVjdCgpO1xuXG4gICAgICBhd2FpdCByZWdpc3RyeS5pbml0aWF0ZVByb3ZpZGVyKCdvcmFjbGUnLCAxMCk7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCByZWdpc3RyeS5xdWVyeVByb3ZpZGVyTGlzdCgwLCAtMSwgMTApO1xuICAgICAgYXdhaXQgZXhwZWN0KHJlcy5yb3dzWzBdLnRpdGxlKS50by5iZS5lcXVhbCgnb3JhY2xlJyk7XG4gICAgICBhd2FpdCByZWdpc3RyeS5hZGRFbmRwb2ludCgndGVzdF9lbmRwb2ludCcsIFszLCAwLCAwLCAyLCAxMDAwMF0sICcnKTtcbiAgICAgIGNvbnN0IHJlczIgPSBhd2FpdCByZWdpc3RyeS5xdWVyeVByb3ZpZGVyRW5kcG9pbnRzKDAsIC0xLCAxMCk7XG4gICAgICBhd2FpdCBleHBlY3QocmVzMi5yb3dzWzBdLnNwZWNpZmllcikudG8uYmUuZXF1YWwoJ3Rlc3RfZW5kcG9pbnQnKTtcbiAgICAgIGF3YWl0IG1pbnRpbmcuaXNzdWVUb2tlbnMoW3tpZDogbm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfdXNlci5uYW1lLCBxdWFudGl0eTogJzEwMDAwMCBUU1QnfV0sICdoaScpO1xuICAgICAgY29uc29sZS5sb2coYXdhaXQgZW9zLmdldEN1cnJlbmN5QmFsYW5jZSgnemFwLnRva2VuJywgJ3VzZXInLCAnVFNUJykpO1xuICAgICAgYXdhaXQgYm9uZGFnZS5ib25kKG5vZGUuZ2V0QWNjb3VudHMoKS5hY2NvdW50X3Byb3ZpZGVyLm5hbWUsICd0ZXN0X2VuZHBvaW50JywgMSk7Ly9BY3Rpb24gdmFsaWRhdGUgZXhjZXB0aW9uINC/0YDQuCDRjdGC0L7QvCDRgyB1c2VyLCDQutC+0YLQvtGA0YvQuSBzdWJzY3JpYmVyICAtIFwiYWNjb3VudHNcIjpbe1wicGVybWlzc2lvblwiOntcImFjdG9yXCI6XCJ6YXAubWFpblwiLFwicGVybWlzc2lvblwiOlwiZW9zaW8uY29kZVwifSxcIndlaWdodFwiOjF9XSxcbiAgICAgIGNvbnNvbGUubG9nKGF3YWl0IGVvcy5nZXRDdXJyZW5jeUJhbGFuY2UoJ3phcC50b2tlbicsICd1c2VyJywgJ1RTVCcpKTtcbiAgICAgIGNvbnN0IGhvbGRlcnMgPSBhd2FpdCBib25kYWdlLnF1ZXJ5SG9sZGVycygwLCAxMCwgMTApO1xuICAgICAgY29uc3QgaXNzdWVkID0gYXdhaXQgYm9uZGFnZS5xdWVyeUlzc3VlZCgwLCAxMCwgMTApO1xuICAgICAgY29uc29sZS5sb2coaG9sZGVycywgaXNzdWVkKTtcbiAgICAgIC8vYXdhaXQgZXhwZWN0KGlzc3VlZC5yb3dzWzBdLmRvdHMpLnRvLmJlLmVxdWFsKDEpO1xuICAgICAgLy9hd2FpdCBleHBlY3QoaG9sZGVycy5yb3dzWzBdLmRvdHMpLnRvLmJlLmVxdWFsKDEpO1xuXG5cbiAgICB9KVxufSk7XG4iXX0=