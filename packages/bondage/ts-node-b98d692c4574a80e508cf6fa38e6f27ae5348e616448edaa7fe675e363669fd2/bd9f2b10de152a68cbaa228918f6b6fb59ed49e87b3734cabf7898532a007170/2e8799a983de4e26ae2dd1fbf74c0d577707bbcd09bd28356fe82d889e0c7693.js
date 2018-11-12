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
        let holder = yield getRowsByPrimaryKey(eos, node, node.getUserAccount().name, 'holder', 'provider');
        yield expect(holder.rows[0].dots).to.be.equal(1);
    }));
    after(() => {
        node.kill();
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvYm9uZGFnZS9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQ3pCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1osTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixzREFBNkM7QUFDN0MsMkJBQTRCO0FBQzVCLCtDQUErQztBQUkvQyw4QkFBb0MsSUFBYzs7UUFDOUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztJQUNqQixDQUFDO0NBQUE7QUFFRCw2QkFBbUMsR0FBUSxFQUFFLElBQVMsRUFBRSxLQUFhLEVBQUUsVUFBa0IsRUFBRSxTQUFpQjs7UUFDeEcsT0FBTyxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQ3pCLElBQUksRUFBRSxPQUFPO1FBQ2IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPO1FBQ2xDLEtBQUssRUFBRSxRQUFRO1FBQ2YsVUFBVSxFQUFFLGFBQWE7UUFDekIsU0FBUyxFQUFFLFlBQVk7UUFDdkIsQ0FBQyxFQUFFLGNBQWM7UUFDakIsQ0FBQyxDQUFDLEVBQUUsY0FBYztRQUNsQixFQUFFLEVBQUUsUUFBUTtRQUNaLEtBQUssRUFBRSxXQUFXO1FBQ2xCLENBQUMsQ0FBQyxpQkFBaUI7U0FDdEIsQ0FBQztJQUNOLENBQUM7Q0FBQTtBQUVELFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ2xCLElBQUksSUFBUyxDQUFDO0lBQ2QsSUFBSSxRQUFrQixDQUFDO0lBQ3ZCLElBQUksT0FBZ0IsQ0FBQztJQUVyQixNQUFNLENBQUMsVUFBVSxJQUFJO1FBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEIsb0JBQW9CLENBQUMsR0FBUyxFQUFFO1lBQzVCLElBQUk7Z0JBQ0EsSUFBSSxHQUFHLElBQUksc0JBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3JCLFFBQVEsR0FBRyxJQUFJLHVCQUFRLENBQUM7b0JBQ3BCLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7b0JBQ2xDLElBQUk7aUJBQ1AsQ0FBQyxDQUFDO2dCQUNILE9BQU8sR0FBRyxJQUFJLFdBQU8sQ0FBQztvQkFDbEIsT0FBTyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQzlCLElBQUk7aUJBQ1AsQ0FBQyxDQUFDO2FBRU47WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xCO1lBQ0QsSUFBSSxFQUFFLENBQUM7UUFDWCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsVUFBVSxFQUFFLEdBQVMsRUFBRTtRQUN0QixJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvQixNQUFNLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0MsTUFBTSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RCxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFJLE1BQU0sR0FBRyxNQUFNLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDcEcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLEdBQUcsRUFBRTtRQUNQLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhwZWN0ID0gcmVxdWlyZSgnY2hhaScpXG4gICAgLnVzZShyZXF1aXJlKCdjaGFpLWFzLXByb21pc2VkJykpXG4gICAgLnVzZShyZXF1aXJlKCdjaGFpLWJpZ251bWJlcicpKVxuICAgIC5leHBlY3Q7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHtSZWdzaXRyeX0gZnJvbSBcIkB6YXBqcy9lb3MtcmVnaXN0cnlcIjtcbmltcG9ydCB7Qm9uZGFnZX0gZnJvbSBcIi4uL1wiO1xuaW1wb3J0IHtUZXN0Tm9kZSBhcyBOb2RlfSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gXCJAemFwanMvZW9zLXV0aWxzXCI7XG5cblxuYXN5bmMgZnVuY3Rpb24gY29uZmlndXJlRW52aXJvbm1lbnQoZnVuYzogRnVuY3Rpb24pIHtcbiAgICBhd2FpdCBmdW5jKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFJvd3NCeVByaW1hcnlLZXkoZW9zOiBhbnksIG5vZGU6IGFueSwgc2NvcGU6IHN0cmluZywgdGFibGVfbmFtZTogc3RyaW5nLCB0YWJsZV9rZXk6IHN0cmluZykge1xuICAgIHJldHVybiBhd2FpdCBlb3MuZ2V0VGFibGVSb3dzKFxuICAgICAgICB0cnVlLCAvLyBqc29uXG4gICAgICAgIG5vZGUuZ2V0WmFwQWNjb3VudCgpLm5hbWUsIC8vIGNvZGVcbiAgICAgICAgc2NvcGUsIC8vIHNjb3BlXG4gICAgICAgIHRhYmxlX25hbWUsIC8vIHRhYmxlIG5hbWVcbiAgICAgICAgdGFibGVfa2V5LCAvLyB0YWJsZV9rZXlcbiAgICAgICAgMCwgLy8gbG93ZXJfYm91bmRcbiAgICAgICAgLTEsIC8vIHVwcGVyX2JvdW5kXG4gICAgICAgIDEwLCAvLyBsaW1pdFxuICAgICAgICAnaTY0JywgLy8ga2V5X3R5cGVcbiAgICAgICAgMSAvLyBpbmRleCBwb3NpdGlvblxuICAgICk7XG59XG5cbmRlc2NyaWJlKCdUZXN0JywgKCkgPT4ge1xuICAgIGxldCBub2RlOiBhbnk7XG4gICAgbGV0IHJlZ2lzdHJ5OiBSZWdzaXRyeTtcbiAgICBsZXQgYm9uZGFnZTogQm9uZGFnZTtcblxuICAgIGJlZm9yZShmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB0aGlzLnRpbWVvdXQoMzAwMDApO1xuICAgICAgICBjb25maWd1cmVFbnZpcm9ubWVudChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSBuZXcgTm9kZShmYWxzZSwgZmFsc2UsICdodHRwOi8vMTI3LjAuMC4xOjg4ODgnKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLmluaXQoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLmNvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICByZWdpc3RyeSA9IG5ldyBSZWdzaXRyeSh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG5vZGUuZ2V0UHJvdmlkZXJBY2NvdW50KCksXG4gICAgICAgICAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBib25kYWdlID0gbmV3IEJvbmRhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldFVzZXJBY2NvdW50KCksXG4gICAgICAgICAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCcjcXVlcnkoKScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgbGV0IGVvcyA9IGF3YWl0IG5vZGUuY29ubmVjdCgpO1xuICAgICAgICBhd2FpdCByZWdpc3RyeS5pbml0aWF0ZVByb3ZpZGVyKCd0ZXN0cycsIDEwKTtcbiAgICAgICAgYXdhaXQgcmVnaXN0cnkuYWRkRW5kcG9pbnQoJ2VuZHAnLCBbMywgMCwgMCwgMiwgMTAwMDBdLCAnJyk7XG4gICAgICAgIGF3YWl0IGJvbmRhZ2UuYm9uZChub2RlLmdldFByb3ZpZGVyQWNjb3VudCgpLm5hbWUsICdlbmRwJywgMSk7XG4gICAgICAgIGxldCBob2xkZXIgPSBhd2FpdCBnZXRSb3dzQnlQcmltYXJ5S2V5KGVvcywgbm9kZSwgbm9kZS5nZXRVc2VyQWNjb3VudCgpLm5hbWUsICdob2xkZXInLCAncHJvdmlkZXInKTtcbiAgICAgICAgYXdhaXQgZXhwZWN0KGhvbGRlci5yb3dzWzBdLmRvdHMpLnRvLmJlLmVxdWFsKDEpO1xuICAgIH0pO1xuXG4gICAgYWZ0ZXIoKCkgPT4ge1xuICAgICAgICBub2RlLmtpbGwoKTtcbiAgICB9KVxufSk7XG4iXX0=