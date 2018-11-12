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
        yield bondage.bond(node.getAccounts().account_provider.name, 'test_endpoint', 1); //Action validate exception при этом у user, который subscriber  - "accounts":[{"permission":{"actor":"zap.main","permission":"eosio.code"},"weight":1}],
        console.log(yield eos.getCurrencyBalance(node.zap.name, 'user', 'TST'));
        const holders = yield bondage.queryHolders(0, 1, 1);
        const issued = yield bondage.queryIssued(0, 1, 1);
        yield expect(issued.rows[0].dots).to.be.equal(1);
        yield expect(holders.rows[0].dots).to.be.equal(1);
    }));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvYm9uZGFnZS9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQzdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QiwrQ0FBaUQ7QUFDakQsbUNBQW9DO0FBRXBDLCtDQUFnRDtBQUVoRCwwREFBNEQ7QUFLNUQsOEJBQW9DLElBQWM7O1FBQzlDLE1BQU0sSUFBSSxFQUFFLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBRUQsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7SUFDbEIsTUFBTSxJQUFJLEdBQUksSUFBSSxzQkFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUM5RCxJQUFJLFFBQWEsQ0FBQztJQUNsQixJQUFJLE9BQVksQ0FBQztJQUNqQixJQUFJLE9BQVksQ0FBQztJQUNqQixJQUFJLEdBQVEsQ0FBQztJQUNiLE1BQU0sQ0FBQyxVQUFVLElBQUk7UUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQixvQkFBb0IsQ0FBQyxHQUFTLEVBQUU7WUFDNUIsSUFBSTtnQkFDQSxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckIsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUks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LENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBR3BELENBQUMsQ0FBQSxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGV4cGVjdCA9IHJlcXVpcmUoJ2NoYWknKVxuLnVzZShyZXF1aXJlKCdjaGFpLWFzLXByb21pc2VkJykpXG4udXNlKHJlcXVpcmUoJ2NoYWktYmlnbnVtYmVyJykpXG4uZXhwZWN0O1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCB7IFJlZ3NpdHJ5IH0gZnJvbSBcIi4uLy4uLy4uL3JlZ2lzdHJ5L291dFwiO1xuaW1wb3J0IHsgQm9uZGFnZSB9IGZyb20gXCIuLi8uLi9zcmNcIjtcbmltcG9ydCB7IEFjY291bnQsIERlcGxveWVyIH0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQgeyBUZXN0Tm9kZSBhcyBOb2RlfSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gXCJAemFwanMvZW9zLXV0aWxzXCI7XG5pbXBvcnQgeyB0b2tlbk1pbnRpbmcgfSBmcm9tIFwiLi4vLi4vLi4vbWludGluZy9vdXQvbWludGluZ1wiO1xuXG5cblxuXG5hc3luYyBmdW5jdGlvbiBjb25maWd1cmVFbnZpcm9ubWVudChmdW5jOiBGdW5jdGlvbikge1xuICAgIGF3YWl0IGZ1bmMoKTtcbn1cblxuZGVzY3JpYmUoJ1Rlc3QnLCAoKSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9ICBuZXcgTm9kZShmYWxzZSwgZmFsc2UsICdodHRwOi8vMTI3LjAuMC4xOjg4ODgnKTtcbiAgICBsZXQgcmVnaXN0cnk6IGFueTtcbiAgICBsZXQgYm9uZGFnZTogYW55O1xuICAgIGxldCBtaW50aW5nOiBhbnk7XG4gICAgbGV0IGVvczogYW55O1xuICAgIGJlZm9yZShmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB0aGlzLnRpbWVvdXQoMzAwMDApO1xuICAgICAgICBjb25maWd1cmVFbnZpcm9ubWVudChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IG5vZGUucmVzdGFydCgpO1xuICAgICAgICAgICAgICAgIGVvcyA9IGF3YWl0IG5vZGUuaW5pdCgpO1xuICAgICAgICAgICAgICAgIHJlZ2lzdHJ5ID0gYXdhaXQgbmV3IFJlZ3NpdHJ5KHtcbiAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG5vZGUuZ2V0QWNjb3VudHMoKS5hY2NvdW50X3Byb3ZpZGVyLFxuICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJvbmRhZ2UgPSBhd2FpdCBuZXcgQm9uZGFnZSh7XG4gICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldEFjY291bnRzKCkuYWNjb3VudF91c2VyLFxuICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG1pbnRpbmcgPSBhd2FpdCBuZXcgdG9rZW5NaW50aW5nKG5vZGUuZ2V0QWNjb3VudHMoKS5hY2NvdW50X3Rva2VuLCBub2RlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgY29uc29sZS5sb2coZSk7IH1cbiAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCcjYm9uZCgpJywgYXN5bmMoKSA9PiB7XG4gICAgICBjb25zdCBlb3MgPSBhd2FpdCBub2RlLmNvbm5lY3QoKTtcblxuICAgICAgYXdhaXQgcmVnaXN0cnkuaW5pdGlhdGVQcm92aWRlcignb3JhY2xlJywgMTApO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCByZWdpc3RyeS5xdWVyeVByb3ZpZGVyTGlzdCgwLCAtMSwgMTApO1xuICAgICAgYXdhaXQgZXhwZWN0KHJlcy5yb3dzWzBdLnRpdGxlKS50by5iZS5lcXVhbCgnb3JhY2xlJyk7XG4gICAgICBhd2FpdCByZWdpc3RyeS5hZGRFbmRwb2ludCgndGVzdF9lbmRwb2ludCcsIFszLCAwLCAwLCAyLCAxMDAwMF0sICcnKTtcbiAgICAgIGNvbnN0IHJlczIgPSBhd2FpdCByZWdpc3RyeS5xdWVyeVByb3ZpZGVyRW5kcG9pbnRzKDAsIC0xLCAxMCk7XG4gICAgICBhd2FpdCBleHBlY3QocmVzMi5yb3dzWzBdLnNwZWNpZmllcikudG8uYmUuZXF1YWwoJ3Rlc3RfZW5kcG9pbnQnKTtcbiAgICAgIGF3YWl0IG1pbnRpbmcuaXNzdWVUb2tlbnMoW3tpZDogbm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfdXNlci5uYW1lLCBxdWFudGl0eTogJzEwMDAwMCBUU1QnfV0sICdoaScpO1xuICAgICAgYXdhaXQgYm9uZGFnZS5ib25kKG5vZGUuZ2V0QWNjb3VudHMoKS5hY2NvdW50X3Byb3ZpZGVyLm5hbWUsICd0ZXN0X2VuZHBvaW50JywgMSk7Ly9BY3Rpb24gdmFsaWRhdGUgZXhjZXB0aW9uINC/0YDQuCDRjdGC0L7QvCDRgyB1c2VyLCDQutC+0YLQvtGA0YvQuSBzdWJzY3JpYmVyICAtIFwiYWNjb3VudHNcIjpbe1wicGVybWlzc2lvblwiOntcImFjdG9yXCI6XCJ6YXAubWFpblwiLFwicGVybWlzc2lvblwiOlwiZW9zaW8uY29kZVwifSxcIndlaWdodFwiOjF9XSxcbiAgICAgIGNvbnNvbGUubG9nKGF3YWl0IGVvcy5nZXRDdXJyZW5jeUJhbGFuY2Uobm9kZS56YXAubmFtZSwgJ3VzZXInLCAnVFNUJykpO1xuICAgICAgY29uc3QgaG9sZGVycyA9IGF3YWl0IGJvbmRhZ2UucXVlcnlIb2xkZXJzKDAsIDEsIDEpO1xuICAgICAgY29uc3QgaXNzdWVkID0gYXdhaXQgYm9uZGFnZS5xdWVyeUlzc3VlZCgwLCAxLCAxKTtcbiAgICAgIGF3YWl0IGV4cGVjdChpc3N1ZWQucm93c1swXS5kb3RzKS50by5iZS5lcXVhbCgxKTtcbiAgICAgIGF3YWl0IGV4cGVjdChob2xkZXJzLnJvd3NbMF0uZG90cykudG8uYmUuZXF1YWwoMSk7XG5cblxuICAgIH0pXG59KTtcbiJdfQ==