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
    it('#bond()', () => __awaiter(this, void 0, void 0, function* () {
        let eos = yield node.connect();
        yield minting.issueTokens([{ id: node.getUserAccount().name, quantity: '300000 TST' }], 'hi');
        yield registry.initiateProvider('tests', 10);
        yield registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
        yield bondage.bond(node.getProviderAccount().name, 'endp', 1);
        const issued = yield bondage.queryIssued(node.getProviderAccount().name, 0, 1, 1);
        const holders = yield bondage.queryHolders(0, -1, 10);
        yield expect(issued.rows[0].dots).to.be.equal(1);
        yield expect(holders.rows[0].dots).to.be.equal(1);
    }));
    it('#unbond()', () => __awaiter(this, void 0, void 0, function* () {
        yield bondage.unbond(node.getProviderAccount().name, 'endp', 1);
        const issued = yield bondage.queryIssued(node.getProviderAccount().name, 0, 1, 1);
        const holders = yield bondage.queryHolders(0, -1, 10);
        yield expect(issued.rows[0].dots).to.be.equal(1);
        yield expect(holders.rows[0].dots).to.be.equal(1);
    }));
    after(() => {
        node.kill();
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvYm9uZGFnZS9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQ3pCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1osTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixzREFBNkM7QUFDN0MsNENBQXVDO0FBQ3ZDLDJCQUE0QjtBQUM1QiwrQ0FBK0M7QUFJL0MsOEJBQW9DLElBQWM7O1FBQzlDLE1BQU0sSUFBSSxFQUFFLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBRUQsNkJBQW1DLEdBQVEsRUFBRSxJQUFTLEVBQUUsS0FBYSxFQUFFLFVBQWtCLEVBQUUsU0FBaUI7O1FBQ3hHLE9BQU8sTUFBTSxHQUFHLENBQUMsWUFBWSxDQUN6QixJQUFJLEVBQUUsT0FBTztRQUNiLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTztRQUNsQyxLQUFLLEVBQUUsUUFBUTtRQUNmLFVBQVUsRUFBRSxhQUFhO1FBQ3pCLFNBQVMsRUFBRSxZQUFZO1FBQ3ZCLENBQUMsRUFBRSxjQUFjO1FBQ2pCLENBQUMsQ0FBQyxFQUFFLGNBQWM7UUFDbEIsRUFBRSxFQUFFLFFBQVE7UUFDWixLQUFLLEVBQUUsV0FBVztRQUNsQixDQUFDLENBQUMsaUJBQWlCO1NBQ3RCLENBQUM7SUFDTixDQUFDO0NBQUE7QUFFRCxRQUFRLENBQUMs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Q0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoRSxNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEYsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN0RCxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxHQUFHLEVBQUU7UUFDUCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGV4cGVjdCA9IHJlcXVpcmUoJ2NoYWknKVxuICAgIC51c2UocmVxdWlyZSgnY2hhaS1hcy1wcm9taXNlZCcpKVxuICAgIC51c2UocmVxdWlyZSgnY2hhaS1iaWdudW1iZXInKSlcbiAgICAuZXhwZWN0O1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCB7UmVnc2l0cnl9IGZyb20gXCJAemFwanMvZW9zLXJlZ2lzdHJ5XCI7XG5pbXBvcnQge01pbnRpbmd9IGZyb20gXCJAemFwanMvbWludGluZ1wiO1xuaW1wb3J0IHtCb25kYWdlfSBmcm9tIFwiLi4vXCI7XG5pbXBvcnQge1Rlc3ROb2RlIGFzIE5vZGV9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSBcIkB6YXBqcy9lb3MtdXRpbHNcIjtcblxuXG5hc3luYyBmdW5jdGlvbiBjb25maWd1cmVFbnZpcm9ubWVudChmdW5jOiBGdW5jdGlvbikge1xuICAgIGF3YWl0IGZ1bmMoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0Um93c0J5UHJpbWFyeUtleShlb3M6IGFueSwgbm9kZTogYW55LCBzY29wZTogc3RyaW5nLCB0YWJsZV9uYW1lOiBzdHJpbmcsIHRhYmxlX2tleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGF3YWl0IGVvcy5nZXRUYWJsZVJvd3MoXG4gICAgICAgIHRydWUsIC8vIGpzb25cbiAgICAgICAgbm9kZS5nZXRaYXBBY2NvdW50KCkubmFtZSwgLy8gY29kZVxuICAgICAgICBzY29wZSwgLy8gc2NvcGVcbiAgICAgICAgdGFibGVfbmFtZSwgLy8gdGFibGUgbmFtZVxuICAgICAgICB0YWJsZV9rZXksIC8vIHRhYmxlX2tleVxuICAgICAgICAwLCAvLyBsb3dlcl9ib3VuZFxuICAgICAgICAtMSwgLy8gdXBwZXJfYm91bmRcbiAgICAgICAgMTAsIC8vIGxpbWl0XG4gICAgICAgICdpNjQnLCAvLyBrZXlfdHlwZVxuICAgICAgICAxIC8vIGluZGV4IHBvc2l0aW9uXG4gICAgKTtcbn1cblxuZGVzY3JpYmUoJ1Rlc3QnLCAoKSA9PiB7XG4gICAgbGV0IG5vZGU6IGFueTtcbiAgICBsZXQgcmVnaXN0cnk6IFJlZ3NpdHJ5O1xuICAgIGxldCBib25kYWdlOiBCb25kYWdlO1xuICAgIGxldCBtaW50aW5nOiBNaW50aW5nO1xuXG4gICAgYmVmb3JlKGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHRoaXMudGltZW91dCgzMDAwMCk7XG4gICAgICAgIGNvbmZpZ3VyZUVudmlyb25tZW50KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5ldyBOb2RlKGZhbHNlLCBmYWxzZSwgJ2h0dHA6Ly8xMjcuMC4wLjE6ODg4OCcpO1xuICAgICAgICAgICAgICAgIGF3YWl0IG5vZGUucmVzdGFydCgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IG5vZGUuaW5pdCgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IG5vZGUuY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlZ2lzdHJ5ID0gbmV3IFJlZ3NpdHJ5KHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRQcm92aWRlckFjY291bnQoKSxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJvbmRhZ2UgPSBuZXcgQm9uZGFnZSh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG5vZGUuZ2V0VXNlckFjY291bnQoKSxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG1pbnRpbmcgPSBhd2FpdCBuZXcgTWludGluZyhub2RlLmdldFRva2VuQWNjb3VudCgpLCBub2RlKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCcjYm9uZCgpJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgZW9zID0gYXdhaXQgbm9kZS5jb25uZWN0KCk7XG4gICAgICAgIGF3YWl0IG1pbnRpbmcuaXNzdWVUb2tlbnMoW3tpZDogbm9kZS5nZXRVc2VyQWNjb3VudCgpLm5hbWUsIHF1YW50aXR5OiAnMzAwMDAwIFRTVCd9XSwgJ2hpJyk7XG4gICAgICAgIGF3YWl0IHJlZ2lzdHJ5LmluaXRpYXRlUHJvdmlkZXIoJ3Rlc3RzJywgMTApO1xuICAgICAgICBhd2FpdCByZWdpc3RyeS5hZGRFbmRwb2ludCgnZW5kcCcsIFszLCAwLCAwLCAyLCAxMDAwMF0sICcnKTtcbiAgICAgICAgYXdhaXQgYm9uZGFnZS5ib25kKG5vZGUuZ2V0UHJvdmlkZXJBY2NvdW50KCkubmFtZSwgJ2VuZHAnLCAxKTtcbiAgICAgICAgY29uc3QgaXNzdWVkID0gYXdhaXQgYm9uZGFnZS5xdWVyeUlzc3VlZChub2RlLmdldFByb3ZpZGVyQWNjb3VudCgpLm5hbWUsIDAsIDEsIDEpO1xuICAgICAgICBjb25zdCBob2xkZXJzID0gYXdhaXQgYm9uZGFnZS5xdWVyeUhvbGRlcnMoMCwgLTEsIDEwKTtcbiAgICAgICAgYXdhaXQgZXhwZWN0KGlzc3VlZC5yb3dzWzBdLmRvdHMpLnRvLmJlLmVxdWFsKDEpO1xuICAgICAgICBhd2FpdCBleHBlY3QoaG9sZGVycy5yb3dzWzBdLmRvdHMpLnRvLmJlLmVxdWFsKDEpO1xuICAgIH0pO1xuICAgIGl0KCcjdW5ib25kKCknLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBib25kYWdlLnVuYm9uZChub2RlLmdldFByb3ZpZGVyQWNjb3VudCgpLm5hbWUsICdlbmRwJywgMSk7XG4gICAgICBjb25zdCBpc3N1ZWQgPSBhd2FpdCBib25kYWdlLnF1ZXJ5SXNzdWVkKG5vZGUuZ2V0UHJvdmlkZXJBY2NvdW50KCkubmFtZSwgMCwgMSwgMSk7XG4gICAgICBjb25zdCBob2xkZXJzID0gYXdhaXQgYm9uZGFnZS5xdWVyeUhvbGRlcnMoMCwgLTEsIDEwKTtcbiAgICAgIGF3YWl0IGV4cGVjdChpc3N1ZWQucm93c1swXS5kb3RzKS50by5iZS5lcXVhbCgxKTtcbiAgICAgIGF3YWl0IGV4cGVjdChob2xkZXJzLnJvd3NbMF0uZG90cykudG8uYmUuZXF1YWwoMSk7XG4gICAgfSk7XG5cbiAgICBhZnRlcigoKSA9PiB7XG4gICAgICAgIG5vZGUua2lsbCgpO1xuICAgIH0pXG59KTtcbiJdfQ==