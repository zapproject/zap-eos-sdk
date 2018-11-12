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
        yield minting.issueTokens([{ id: node.getUserAccount().name, quantity: '100000 TST' }], 'hi');
        console.log(yield eos.getCurrencyBalance(node.getTokenAccount().name, node.getUserAccount().name, 'TST'));
        yield registry.initiateProvider('tests', 10);
        yield registry.addEndpoint('endp', [3, 0, 0, 2, 10000], '');
        yield bondage.bond(node.getProviderAccount().name, 'endp', 1);
        let holder = yield getRowsByPrimaryKey(eos, node, node.getUserAccount().name, 'holder', 'provider');
        yield expect(holder.rows[0].dots).to.be.equal(1);
    }));
    after(() => {
        node.kill();
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvYm9uZGFnZS9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQ3pCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1osTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixzREFBNkM7QUFDN0MsNENBQXVDO0FBQ3ZDLDJCQUE0QjtBQUM1QiwrQ0FBK0M7QUFJL0MsOEJBQW9DLElBQWM7O1FBQzlDLE1BQU0sSUFBSSxFQUFFLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBRUQsNkJBQW1DLEdBQVEsRUFBRSxJQUFTLEVBQUUsS0FBYSxFQUFFLFVBQWtCLEVBQUUsU0FBaUI7O1FBQ3hHLE9BQU8sTUFBTSxHQUFHLENBQUMsWUFBWSxDQUN6QixJQUFJLEVBQUUsT0FBTztRQUNiLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTztRQUNsQyxLQUFLLEVBQUUsUUFBUTtRQUNmLFVBQVUsRUFBRSxhQUFhO1FBQ3pCLFNBQVMsRUFBRSxZQUFZO1FBQ3ZCLENBQUMsRUFBRSxjQUFjO1FBQ2pCLENBQUMsQ0FBQyxFQUFFLGNBQWM7UUFDbEIsRUFBRSxFQUFFLFFBQVE7UUFDWixLQUFLLEVBQUUsV0FBVztRQUNsQixDQUFDLENBQUMsaUJBQWlCO1NBQ3RCLENBQUM7SUFDTixDQUFDO0NBQUE7QUFFRCxRQUFRLENBQUMs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bnQiOlsiY29uc3QgZXhwZWN0ID0gcmVxdWlyZSgnY2hhaScpXG4gICAgLnVzZShyZXF1aXJlKCdjaGFpLWFzLXByb21pc2VkJykpXG4gICAgLnVzZShyZXF1aXJlKCdjaGFpLWJpZ251bWJlcicpKVxuICAgIC5leHBlY3Q7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHtSZWdzaXRyeX0gZnJvbSBcIkB6YXBqcy9lb3MtcmVnaXN0cnlcIjtcbmltcG9ydCB7TWludGluZ30gZnJvbSBcIkB6YXBqcy9taW50aW5nXCI7XG5pbXBvcnQge0JvbmRhZ2V9IGZyb20gXCIuLi9cIjtcbmltcG9ydCB7VGVzdE5vZGUgYXMgTm9kZX0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQgKiBhcyBVdGlscyBmcm9tIFwiQHphcGpzL2Vvcy11dGlsc1wiO1xuXG5cbmFzeW5jIGZ1bmN0aW9uIGNvbmZpZ3VyZUVudmlyb25tZW50KGZ1bmM6IEZ1bmN0aW9uKSB7XG4gICAgYXdhaXQgZnVuYygpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRSb3dzQnlQcmltYXJ5S2V5KGVvczogYW55LCBub2RlOiBhbnksIHNjb3BlOiBzdHJpbmcsIHRhYmxlX25hbWU6IHN0cmluZywgdGFibGVfa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gYXdhaXQgZW9zLmdldFRhYmxlUm93cyhcbiAgICAgICAgdHJ1ZSwgLy8ganNvblxuICAgICAgICBub2RlLmdldFphcEFjY291bnQoKS5uYW1lLCAvLyBjb2RlXG4gICAgICAgIHNjb3BlLCAvLyBzY29wZVxuICAgICAgICB0YWJsZV9uYW1lLCAvLyB0YWJsZSBuYW1lXG4gICAgICAgIHRhYmxlX2tleSwgLy8gdGFibGVfa2V5XG4gICAgICAgIDAsIC8vIGxvd2VyX2JvdW5kXG4gICAgICAgIC0xLCAvLyB1cHBlcl9ib3VuZFxuICAgICAgICAxMCwgLy8gbGltaXRcbiAgICAgICAgJ2k2NCcsIC8vIGtleV90eXBlXG4gICAgICAgIDEgLy8gaW5kZXggcG9zaXRpb25cbiAgICApO1xufVxuXG5kZXNjcmliZSgnVGVzdCcsICgpID0+IHtcbiAgICBsZXQgbm9kZTogYW55O1xuICAgIGxldCByZWdpc3RyeTogUmVnc2l0cnk7XG4gICAgbGV0IGJvbmRhZ2U6IEJvbmRhZ2U7XG4gICAgbGV0IG1pbnRpbmc6IE1pbnRpbmc7XG5cbiAgICBiZWZvcmUoZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdGhpcy50aW1lb3V0KDMwMDAwKTtcbiAgICAgICAgY29uZmlndXJlRW52aXJvbm1lbnQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBub2RlID0gbmV3IE5vZGUoZmFsc2UsIGZhbHNlLCAnaHR0cDovLzEyNy4wLjAuMTo4ODg4Jyk7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5pbml0KCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5jb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgcmVnaXN0cnkgPSBuZXcgUmVnc2l0cnkoe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldFByb3ZpZGVyQWNjb3VudCgpLFxuICAgICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYm9uZGFnZSA9IG5ldyBCb25kYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRVc2VyQWNjb3VudCgpLFxuICAgICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbWludGluZyA9IGF3YWl0IG5ldyBNaW50aW5nKG5vZGUuZ2V0VG9rZW5BY2NvdW50KCksIG5vZGUpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJyNxdWVyeSgpJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgZW9zID0gYXdhaXQgbm9kZS5jb25uZWN0KCk7XG4gICAgICAgIGF3YWl0IG1pbnRpbmcuaXNzdWVUb2tlbnMoW3tpZDogbm9kZS5nZXRVc2VyQWNjb3VudCgpLm5hbWUsIHF1YW50aXR5OiAnMTAwMDAwIFRTVCd9XSwgJ2hpJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGF3YWl0IGVvcy5nZXRDdXJyZW5jeUJhbGFuY2Uobm9kZS5nZXRUb2tlbkFjY291bnQoKS5uYW1lLCBub2RlLmdldFVzZXJBY2NvdW50KCkubmFtZSwgJ1RTVCcpKTtcbiAgICAgICAgYXdhaXQgcmVnaXN0cnkuaW5pdGlhdGVQcm92aWRlcigndGVzdHMnLCAxMCk7XG4gICAgICAgIGF3YWl0IHJlZ2lzdHJ5LmFkZEVuZHBvaW50KCdlbmRwJywgWzMsIDAsIDAsIDIsIDEwMDAwXSwgJycpO1xuICAgICAgICBhd2FpdCBib25kYWdlLmJvbmQobm9kZS5nZXRQcm92aWRlckFjY291bnQoKS5uYW1lLCAnZW5kcCcsIDEpO1xuICAgICAgICBsZXQgaG9sZGVyID0gYXdhaXQgZ2V0Um93c0J5UHJpbWFyeUtleShlb3MsIG5vZGUsIG5vZGUuZ2V0VXNlckFjY291bnQoKS5uYW1lLCAnaG9sZGVyJywgJ3Byb3ZpZGVyJyk7XG4gICAgICAgIGF3YWl0IGV4cGVjdChob2xkZXIucm93c1swXS5kb3RzKS50by5iZS5lcXVhbCgxKTtcbiAgICB9KTtcblxuICAgIGFmdGVyKCgpID0+IHtcbiAgICAgICAgbm9kZS5raWxsKCk7XG4gICAgfSlcbn0pO1xuIl19