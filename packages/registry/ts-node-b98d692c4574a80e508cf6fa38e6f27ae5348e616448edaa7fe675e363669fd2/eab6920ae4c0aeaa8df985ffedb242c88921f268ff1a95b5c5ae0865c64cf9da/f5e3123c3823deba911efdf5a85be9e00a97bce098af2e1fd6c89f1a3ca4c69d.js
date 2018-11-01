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
                const fork = require('child_process').fork;
                const program = path.resolve(__dirname, '..', '..', '..', 'cacher/index.js');
                const parameters = ['zap.main'];
                const options = { stdio: ['pipe', 1, 2, 'ipc'] };
                const child = fork(program, parameters, options);
                const observer = new EventObserver();
                function getInfo(info) {
                    return __awaiter(this, void 0, void 0, function* () {
                        console.log(info);
                    });
                }
                observer.on("zap.main::addendpoint", getInfo);
                child.on('message', (message) => observer.broadcast(Object.assign({}, message)));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9yZWdpc3RyeS9zcmMvdGVzdC90ZXN0LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL3JlZ2lzdHJ5L3NyYy90ZXN0L3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FDN0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ2hDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUM5QixNQUFNLENBQUM7QUFDUixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLG1DQUFxQztBQUVyQywrQ0FBZ0Q7QUFFaEQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBSTVDLDhCQUFvQyxJQUFjOztRQUM5QyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVELFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ2xCLE1BQU0sSUFBSSxHQUFJLElBQUksc0JBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDOUQsSUFBSSxRQUFhLENBQUM7SUFDbEIsTUFBTSxDQUFDLFVBQVUsSUFBSTtRQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLG9CQUFvQixDQUFDLEdBQVMsRUFBRTtZQUM1QixJQUFJO2dCQUNBLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsUUFBUSxHQUFHLE1BQU0sSUFBSSxjQUFRLENBQUM7b0JBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUMzQixJQUFJO2lCQUNMLENBQUMsQ0FBQztnQkFDSCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLFVBQVUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNoQyxNQUFNLE9BQU8sR0FBRyxFQUFDLEtBQUssRUFBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFDLENBQUM7Z0JBQ2hELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUNyQyxpQkFBdUIsSUFBUzs7d0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQ25CLENBQUM7aUJBQUE7Z0JBQ0QsUUFBUSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDOUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFZLEVBQUUsRUFBRSxDQUFFLFFBQVEsQ0FBQyxTQUFTLG1CQUFLLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDNUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDbkMsSUFBSSxFQUFFLENBQUM7UUFDUCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMscUJBQXFCLEVBQUUsR0FBUSxFQUFFO1FBQ2hDLE1BQU0sUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3QyxNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEQsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ0osRUFBRSxDQUFDLHNCQUFzQixFQUFFLEdBQVEsRUFBRTtRQUNqQyxNQUFNLFFBQVEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekUsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN0RSxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleHBlY3QgPSByZXF1aXJlKCdjaGFpJylcbi51c2UocmVxdWlyZSgnY2hhaS1hcy1wcm9taXNlZCcpKVxuLnVzZShyZXF1aXJlKCdjaGFpLWJpZ251bWJlcicpKVxuLmV4cGVjdDtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQgeyBSZWdzaXRyeSB9IGZyb20gXCIuLi8uLi9zcmNcIjtcbmltcG9ydCB7IEFjY291bnQsIERlcGxveWVyIH0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQgeyBUZXN0Tm9kZSBhcyBOb2RlfSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gXCJAemFwanMvZW9zLXV0aWxzXCI7XG5jb25zdCBFdmVudE9ic2VydmVyID0gcmVxdWlyZSgnLi9saXN0ZW5lcicpO1xuXG5cblxuYXN5bmMgZnVuY3Rpb24gY29uZmlndXJlRW52aXJvbm1lbnQoZnVuYzogRnVuY3Rpb24pIHtcbiAgICBhd2FpdCBmdW5jKCk7XG59XG5cbmRlc2NyaWJlKCdUZXN0JywgKCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSAgbmV3IE5vZGUoZmFsc2UsIGZhbHNlLCAnaHR0cDovLzEyNy4wLjAuMTo4ODg4Jyk7XG4gICAgbGV0IHJlZ2lzdHJ5OiBhbnk7XG4gICAgYmVmb3JlKGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHRoaXMudGltZW91dCgzMDAwMCk7XG4gICAgICAgIGNvbmZpZ3VyZUVudmlyb25tZW50KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgbm9kZS5pbml0KCk7XG4gICAgICAgICAgICAgICAgcmVnaXN0cnkgPSBhd2FpdCBuZXcgUmVnc2l0cnkoe1xuICAgICAgICAgICAgICAgICAgYWNjb3VudDogbm9kZS5nZXRQcm92aWRlcigpLFxuICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZvcmsgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZm9yaztcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmFtID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwnLi4nLCAnLi4nLCAnLi4nLCAnY2FjaGVyL2luZGV4LmpzJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IFsnemFwLm1haW4nXTtcbiAgICAgICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge3N0ZGlvOiAgWydwaXBlJywgMSwgMiwgJ2lwYyddfTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGZvcmsocHJvZ3JhbSwgcGFyYW1ldGVycywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgRXZlbnRPYnNlcnZlcigpO1xuICAgICAgICAgICAgICAgIGFzeW5jIGZ1bmN0aW9uIGdldEluZm8oaW5mbzogYW55KSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpbmZvKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvYnNlcnZlci5vbihcInphcC5tYWluOjphZGRlbmRwb2ludFwiLCBnZXRJbmZvKTtcbiAgICAgICAgICAgICAgICBjaGlsZC5vbignbWVzc2FnZScsIChtZXNzYWdlOiBhbnkpID0+ICBvYnNlcnZlci5icm9hZGNhc3Qoey4uLm1lc3NhZ2V9KSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7IGNvbnNvbGUubG9nKGUpOyB9XG4gICAgICAgIGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnI2luaXRpYXRlUHJvdmlkZXIoKScsIGFzeW5jKCkgPT4ge1xuICAgICAgICBhd2FpdCByZWdpc3RyeS5pbml0aWF0ZVByb3ZpZGVyKCd0ZXN0cycsIDEwKTtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgcmVnaXN0cnkucXVlcnlQcm92aWRlckxpc3QoMCwgLTEsIDEwKTtcbiAgICAgICAgYXdhaXQgZXhwZWN0KHJlcy5yb3dzWzBdLnRpdGxlKS50by5iZS5lcXVhbCgndGVzdHMnKTtcbiAgICAgfSk7XG4gICAgaXQoJyNpbml0aWF0ZUVuZHBvaW50cygpJywgYXN5bmMoKSA9PiB7XG4gICAgICAgIGF3YWl0IHJlZ2lzdHJ5LmFkZEVuZHBvaW50KCd0ZXN0X2VuZHBvaW50cycsIFszLCAwLCAwLCAyLCAxMDAwMF0sICdhY2MnKTtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgcmVnaXN0cnkucXVlcnlQcm92aWRlckVuZHBvaW50cygwLCAtMSwgMTApO1xuICAgICAgICBhd2FpdCBleHBlY3QocmVzLnJvd3NbMF0uc3BlY2lmaWVyKS50by5iZS5lcXVhbCgndGVzdF9lbmRwb2ludHMnKTtcbiAgICB9KTtcbn0pO1xuIl19