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
        yield expect(holder.rows[0].escrow).to.be.equal(1);
        yield expect(holder.rows[0].dots).to.be.equal(0);
    }));
    after(() => {
        node.kill();
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvYm9uZGFnZS9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQ3pCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1osTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixzREFBNkM7QUFDN0MsMkJBQTRCO0FBQzVCLCtDQUErQztBQUkvQyw4QkFBb0MsSUFBYzs7UUFDOUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztJQUNqQixDQUFDO0NBQUE7QUFFRCw2QkFBbUMsR0FBUSxFQUFFLElBQVMsRUFBRSxLQUFhLEVBQUUsVUFBa0IsRUFBRSxTQUFpQjs7UUFDeEcsT0FBTyxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQ3pCLElBQUksRUFBRSxPQUFPO1FBQ2IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPO1FBQ2xDLEtBQUssRUFBRSxRQUFRO1FBQ2YsVUFBVSxFQUFFLGFBQWE7UUFDekIsU0FBUyxFQUFFLFlBQVk7UUFDdkIsQ0FBQyxFQUFFLGNBQWM7UUFDakIsQ0FBQyxDQUFDLEVBQUUsY0FBYztRQUNsQixFQUFFLEVBQUUsUUFBUTtRQUNaLEtBQUssRUFBRSxXQUFXO1FBQ2xCLENBQUMsQ0FBQyxpQkFBaUI7U0FDdEIsQ0FBQztJQUNOLENBQUM7Q0FBQTtBQUVELFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ2xCLElBQUksSUFBUyxDQUFDO0lBQ2QsSUFBSSxRQUFrQixDQUFDO0lBQ3ZCLElBQUksT0FBZ0IsQ0FBQztJQUVyQixNQUFNLENBQUMsVUFBVSxJQUFJO1FBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEIsb0JBQW9CLENBQUMsR0FBUyxFQUFFO1lBQzVCLElBQUk7Z0JBQ0EsSUFBSSxHQUFHLElBQUksc0JBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3JCLFFBQVEsR0FBRyxJQUFJLHVCQUFRLENBQUM7b0JBQ3BCLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7b0JBQ2xDLElBQUk7aUJBQ1AsQ0FBQyxDQUFDO2dCQUNILE9BQU8sR0FBRyxJQUFJLFdBQU8sQ0FBQztvQkFDbEIsT0FBTyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQzlCLElBQUk7aUJBQ1AsQ0FBQyxDQUFDO2FBRU47WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xCO1lBQ0QsSUFBSSxFQUFFLENBQUM7UUFDWCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsVUFBVSxFQUFFLEdBQVMsRUFBRTtRQUN0QixJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvQixNQUFNLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0MsTUFBTSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RCxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFJLE1BQU0sR0FBRyxNQUFNLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDcEcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUMsQ0FBQSxDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQ1AsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleHBlY3QgPSByZXF1aXJlKCdjaGFpJylcbiAgICAudXNlKHJlcXVpcmUoJ2NoYWktYXMtcHJvbWlzZWQnKSlcbiAgICAudXNlKHJlcXVpcmUoJ2NoYWktYmlnbnVtYmVyJykpXG4gICAgLmV4cGVjdDtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQge1JlZ3NpdHJ5fSBmcm9tIFwiQHphcGpzL2Vvcy1yZWdpc3RyeVwiO1xuaW1wb3J0IHtCb25kYWdlfSBmcm9tIFwiLi4vXCI7XG5pbXBvcnQge1Rlc3ROb2RlIGFzIE5vZGV9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSBcIkB6YXBqcy9lb3MtdXRpbHNcIjtcblxuXG5hc3luYyBmdW5jdGlvbiBjb25maWd1cmVFbnZpcm9ubWVudChmdW5jOiBGdW5jdGlvbikge1xuICAgIGF3YWl0IGZ1bmMoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0Um93c0J5UHJpbWFyeUtleShlb3M6IGFueSwgbm9kZTogYW55LCBzY29wZTogc3RyaW5nLCB0YWJsZV9uYW1lOiBzdHJpbmcsIHRhYmxlX2tleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGF3YWl0IGVvcy5nZXRUYWJsZVJvd3MoXG4gICAgICAgIHRydWUsIC8vIGpzb25cbiAgICAgICAgbm9kZS5nZXRaYXBBY2NvdW50KCkubmFtZSwgLy8gY29kZVxuICAgICAgICBzY29wZSwgLy8gc2NvcGVcbiAgICAgICAgdGFibGVfbmFtZSwgLy8gdGFibGUgbmFtZVxuICAgICAgICB0YWJsZV9rZXksIC8vIHRhYmxlX2tleVxuICAgICAgICAwLCAvLyBsb3dlcl9ib3VuZFxuICAgICAgICAtMSwgLy8gdXBwZXJfYm91bmRcbiAgICAgICAgMTAsIC8vIGxpbWl0XG4gICAgICAgICdpNjQnLCAvLyBrZXlfdHlwZVxuICAgICAgICAxIC8vIGluZGV4IHBvc2l0aW9uXG4gICAgKTtcbn1cblxuZGVzY3JpYmUoJ1Rlc3QnLCAoKSA9PiB7XG4gICAgbGV0IG5vZGU6IGFueTtcbiAgICBsZXQgcmVnaXN0cnk6IFJlZ3NpdHJ5O1xuICAgIGxldCBib25kYWdlOiBCb25kYWdlO1xuXG4gICAgYmVmb3JlKGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHRoaXMudGltZW91dCgzMDAwMCk7XG4gICAgICAgIGNvbmZpZ3VyZUVudmlyb25tZW50KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5ldyBOb2RlKGZhbHNlLCBmYWxzZSwgJ2h0dHA6Ly8xMjcuMC4wLjE6ODg4OCcpO1xuICAgICAgICAgICAgICAgIGF3YWl0IG5vZGUucmVzdGFydCgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IG5vZGUuaW5pdCgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IG5vZGUuY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlZ2lzdHJ5ID0gbmV3IFJlZ3NpdHJ5KHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRQcm92aWRlckFjY291bnQoKSxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJvbmRhZ2UgPSBuZXcgQm9uZGFnZSh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG5vZGUuZ2V0VXNlckFjY291bnQoKSxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJyNxdWVyeSgpJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgZW9zID0gYXdhaXQgbm9kZS5jb25uZWN0KCk7XG4gICAgICAgIGF3YWl0IHJlZ2lzdHJ5LmluaXRpYXRlUHJvdmlkZXIoJ3Rlc3RzJywgMTApO1xuICAgICAgICBhd2FpdCByZWdpc3RyeS5hZGRFbmRwb2ludCgnZW5kcCcsIFszLCAwLCAwLCAyLCAxMDAwMF0sICcnKTtcbiAgICAgICAgYXdhaXQgYm9uZGFnZS5ib25kKG5vZGUuZ2V0UHJvdmlkZXJBY2NvdW50KCkubmFtZSwgJ2VuZHAnLCAxKTtcbiAgICAgICAgbGV0IGhvbGRlciA9IGF3YWl0IGdldFJvd3NCeVByaW1hcnlLZXkoZW9zLCBub2RlLCBub2RlLmdldFVzZXJBY2NvdW50KCkubmFtZSwgJ2hvbGRlcicsICdwcm92aWRlcicpO1xuICAgICAgICBhd2FpdCBleHBlY3QoaG9sZGVyLnJvd3NbMF0uZXNjcm93KS50by5iZS5lcXVhbCgxKTtcbiAgICAgICAgYXdhaXQgZXhwZWN0KGhvbGRlci5yb3dzWzBdLmRvdHMpLnRvLmJlLmVxdWFsKDApO1xuICAgIH0pO1xuXG4gICAgYWZ0ZXIoKCkgPT4ge1xuICAgICAgICBub2RlLmtpbGwoKTtcbiAgICB9KVxufSk7XG4iXX0=