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
const src_1 = require("../../src");
const environment_1 = require("./environment");
const EventObserver = require('./listener');
function configureEnvironment(func) {
    return __awaiter(this, void 0, void 0, function* () {
        yield func();
    });
}
describe('Test', () => {
    const node = new environment_1.TestNode(false, false, 'http://127.0.0.1:8888');
    let registry;
    before(function (done) {
        this.timeout(30000);
        configureEnvironment(() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield node.restart();
                yield node.init();
                registry = yield new src_1.Regsitry({
                    account: node.getProvider(),
                    node
                });
                function getInfo(info) {
                    return __awaiter(this, void 0, void 0, function* () {
                        console.log(info);
                    });
                }
                const observer = EventObserver();
                observer.on("zap.main::addendpoint", getInfo);
            }
            catch (e) {
                console.log(e);
            }
            done();
        }));
    });
    it('#initiateProvider()', () => __awaiter(this, void 0, void 0, function* () {
        yield registry.initiateProvider('tests', 10);
        const res = yield registry.queryProviderList(0, -1, 10);
        yield expect(res.rows[0].title).to.be.equal('tests');
    }));
    it('#initiateEndpoints()', () => __awaiter(this, void 0, void 0, function* () {
        yield registry.addEndpoint('test_endpoints', [3, 0, 0, 2, 10000], 'acc');
        const res = yield registry.queryProviderEndpoints(0, -1, 10);
        yield expect(res.rows[0].specifier).to.be.equal('test_endpoints');
    }));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9yZWdpc3RyeS9zcmMvdGVzdC90ZXN0LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL3JlZ2lzdHJ5L3NyYy90ZXN0L3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FDN0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ2hDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUM5QixNQUFNLENBQUM7QUFDUixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLG1DQUFxQztBQUVyQywrQ0FBZ0Q7QUFFaEQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBSTVDLDhCQUFvQyxJQUFjOztRQUM5QyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVELFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ2xCLE1BQU0sSUFBSSxHQUFJLElBQUksc0JBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDOUQsSUFBSSxRQUFhLENBQUM7SUFDbEIsTUFBTSxDQUFDLFVBQVUsSUFBSTtRQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLG9CQUFvQixDQUFDLEdBQVMsRUFBRTtZQUM1QixJQUFJO2dCQUNBLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsUUFBUSxHQUFHLE1BQU0sSUFBSSxjQUFRLENBQUM7b0JBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUMzQixJQUFJO2lCQUNMLENBQUMsQ0FBQztnQkFFSCxpQkFBdUIsSUFBUzs7d0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQ25CLENBQUM7aUJBQUE7Z0JBQ0QsTUFBTSxRQUFRLEdBQUcsYUFBYSxFQUFFLENBQUM7Z0JBQ2pDLFFBQVEsQ0FBQyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDakQ7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDbkMsSUFBSSxFQUFFLENBQUM7UUFDUCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMscUJBQXFCLEVBQUUsR0FBUSxFQUFFO1FBQ2hDLE1BQU0sUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3QyxNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEQsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ0osRUFBRSxDQUFDLHNCQUFzQixFQUFFLEdBQVEsRUFBRTtRQUNqQyxNQUFNLFFBQVEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekUsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN0RSxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleHBlY3QgPSByZXF1aXJlKCdjaGFpJylcbi51c2UocmVxdWlyZSgnY2hhaS1hcy1wcm9taXNlZCcpKVxuLnVzZShyZXF1aXJlKCdjaGFpLWJpZ251bWJlcicpKVxuLmV4cGVjdDtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQgeyBSZWdzaXRyeSB9IGZyb20gXCIuLi8uLi9zcmNcIjtcbmltcG9ydCB7IEFjY291bnQsIERlcGxveWVyIH0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQgeyBUZXN0Tm9kZSBhcyBOb2RlfSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gXCJAemFwanMvZW9zLXV0aWxzXCI7XG5jb25zdCBFdmVudE9ic2VydmVyID0gcmVxdWlyZSgnLi9saXN0ZW5lcicpO1xuXG5cblxuYXN5bmMgZnVuY3Rpb24gY29uZmlndXJlRW52aXJvbm1lbnQoZnVuYzogRnVuY3Rpb24pIHtcbiAgICBhd2FpdCBmdW5jKCk7XG59XG5cbmRlc2NyaWJlKCdUZXN0JywgKCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSAgbmV3IE5vZGUoZmFsc2UsIGZhbHNlLCAnaHR0cDovLzEyNy4wLjAuMTo4ODg4Jyk7XG4gICAgbGV0IHJlZ2lzdHJ5OiBhbnk7XG4gICAgYmVmb3JlKGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHRoaXMudGltZW91dCgzMDAwMCk7XG4gICAgICAgIGNvbmZpZ3VyZUVudmlyb25tZW50KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5pbml0KCk7XG4gICAgICAgICAgICAgICAgcmVnaXN0cnkgPSBhd2FpdCBuZXcgUmVnc2l0cnkoe1xuICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRQcm92aWRlcigpLFxuICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYXN5bmMgZnVuY3Rpb24gZ2V0SW5mbyhpbmZvOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGluZm8pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gRXZlbnRPYnNlcnZlcigpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm9uKFwiemFwLm1haW46OmFkZGVuZHBvaW50XCIsIGdldEluZm8pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmxvZyhlKTsgfVxuICAgICAgICBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJyNpbml0aWF0ZVByb3ZpZGVyKCknLCBhc3luYygpID0+IHtcbiAgICAgICAgYXdhaXQgcmVnaXN0cnkuaW5pdGlhdGVQcm92aWRlcigndGVzdHMnLCAxMCk7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJlZ2lzdHJ5LnF1ZXJ5UHJvdmlkZXJMaXN0KDAsIC0xLCAxMCk7XG4gICAgICAgIGF3YWl0IGV4cGVjdChyZXMucm93c1swXS50aXRsZSkudG8uYmUuZXF1YWwoJ3Rlc3RzJyk7XG4gICAgIH0pO1xuICAgIGl0KCcjaW5pdGlhdGVFbmRwb2ludHMoKScsIGFzeW5jKCkgPT4ge1xuICAgICAgICBhd2FpdCByZWdpc3RyeS5hZGRFbmRwb2ludCgndGVzdF9lbmRwb2ludHMnLCBbMywgMCwgMCwgMiwgMTAwMDBdLCAnYWNjJyk7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJlZ2lzdHJ5LnF1ZXJ5UHJvdmlkZXJFbmRwb2ludHMoMCwgLTEsIDEwKTtcbiAgICAgICAgYXdhaXQgZXhwZWN0KHJlcy5yb3dzWzBdLnNwZWNpZmllcikudG8uYmUuZXF1YWwoJ3Rlc3RfZW5kcG9pbnRzJyk7XG4gICAgfSk7XG59KTtcbiJdfQ==