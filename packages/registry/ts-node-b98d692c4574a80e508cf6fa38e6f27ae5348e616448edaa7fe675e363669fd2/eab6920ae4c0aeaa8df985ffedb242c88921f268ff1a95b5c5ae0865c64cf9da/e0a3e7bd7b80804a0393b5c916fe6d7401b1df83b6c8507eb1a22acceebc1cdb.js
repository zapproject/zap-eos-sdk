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
    const node = new environment_1.TestNode(true, false, 'http://127.0.0.1:8888');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9yZWdpc3RyeS9zcmMvdGVzdC90ZXN0LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL3JlZ2lzdHJ5L3NyYy90ZXN0L3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FDN0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ2hDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUM5QixNQUFNLENBQUM7QUFDUixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLG1DQUFxQztBQUVyQywrQ0FBZ0Q7QUFFaEQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBSTVDLDhCQUFvQyxJQUFjOztRQUM5QyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVELFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ2xCLE1BQU0sSUFBSSxHQUFJLElBQUksc0JBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDN0QsSUFBSSxRQUFhLENBQUM7SUFDbEIsTUFBTSxDQUFDLFVBQVUsSUFBSTtRQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLG9CQUFvQixDQUFDLEdBQVMsRUFBRTtZQUM1QixJQUFJO2dCQUNBLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsUUFBUSxHQUFHLE1BQU0sSUFBSSxjQUFRLENBQUM7b0JBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUMzQixJQUFJO2lCQUNMLENBQUMsQ0FBQztnQkFDSCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2dCQUM1RSxNQUFNLFVBQVUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNoQyxNQUFNLE9BQU8sR0FBRyxFQUFDLEtBQUssRUFBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFDLENBQUM7Z0JBQ2hELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUNyQyxpQkFBdUIsSUFBUzs7d0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQ25CLENBQUM7aUJBQUE7Z0JBQ0QsUUFBUSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDOUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFZLEVBQUUsRUFBRSxDQUFFLFFBQVEsQ0FBQyxTQUFTLG1CQUFLLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDNUU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDbkMsSUFBSSxFQUFFLENBQUM7UUFDUCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMscUJBQXFCLEVBQUUsR0FBUSxFQUFFO1FBQ2hDLE1BQU0sUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3QyxNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEQsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ0osRUFBRSxDQUFDLHNCQUFzQixFQUFFLEdBQVEsRUFBRTtRQUNqQyxNQUFNLFFBQVEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekUsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN0RSxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleHBlY3QgPSByZXF1aXJlKCdjaGFpJylcbi51c2UocmVxdWlyZSgnY2hhaS1hcy1wcm9taXNlZCcpKVxuLnVzZShyZXF1aXJlKCdjaGFpLWJpZ251bWJlcicpKVxuLmV4cGVjdDtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQgeyBSZWdzaXRyeSB9IGZyb20gXCIuLi8uLi9zcmNcIjtcbmltcG9ydCB7IEFjY291bnQsIERlcGxveWVyIH0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQgeyBUZXN0Tm9kZSBhcyBOb2RlfSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gXCJAemFwanMvZW9zLXV0aWxzXCI7XG5jb25zdCBFdmVudE9ic2VydmVyID0gcmVxdWlyZSgnLi9saXN0ZW5lcicpO1xuXG5cblxuYXN5bmMgZnVuY3Rpb24gY29uZmlndXJlRW52aXJvbm1lbnQoZnVuYzogRnVuY3Rpb24pIHtcbiAgICBhd2FpdCBmdW5jKCk7XG59XG5cbmRlc2NyaWJlKCdUZXN0JywgKCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSAgbmV3IE5vZGUodHJ1ZSwgZmFsc2UsICdodHRwOi8vMTI3LjAuMC4xOjg4ODgnKTtcbiAgICBsZXQgcmVnaXN0cnk6IGFueTtcbiAgICBiZWZvcmUoZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdGhpcy50aW1lb3V0KDMwMDAwKTtcbiAgICAgICAgY29uZmlndXJlRW52aXJvbm1lbnQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLmluaXQoKTtcbiAgICAgICAgICAgICAgICByZWdpc3RyeSA9IGF3YWl0IG5ldyBSZWdzaXRyeSh7XG4gICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldFByb3ZpZGVyKCksXG4gICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZm9yayA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5mb3JrO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyYW0gPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCcuLicsICcuLicsICcuLicsICdjYWNoZXIvaW5kZXguanMnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gWyd6YXAubWFpbiddO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7c3RkaW86ICBbJ3BpcGUnLCAxLCAyLCAnaXBjJ119O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gZm9yayhwcm9ncmFtLCBwYXJhbWV0ZXJzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBFdmVudE9ic2VydmVyKCk7XG4gICAgICAgICAgICAgICAgYXN5bmMgZnVuY3Rpb24gZ2V0SW5mbyhpbmZvOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGluZm8pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9ic2VydmVyLm9uKFwiemFwLm1haW46OmFkZGVuZHBvaW50XCIsIGdldEluZm8pO1xuICAgICAgICAgICAgICAgIGNoaWxkLm9uKCdtZXNzYWdlJywgKG1lc3NhZ2U6IGFueSkgPT4gIG9ic2VydmVyLmJyb2FkY2FzdCh7Li4ubWVzc2FnZX0pKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgY29uc29sZS5sb2coZSk7IH1cbiAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCcjaW5pdGlhdGVQcm92aWRlcigpJywgYXN5bmMoKSA9PiB7XG4gICAgICAgIGF3YWl0IHJlZ2lzdHJ5LmluaXRpYXRlUHJvdmlkZXIoJ3Rlc3RzJywgMTApO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCByZWdpc3RyeS5xdWVyeVByb3ZpZGVyTGlzdCgwLCAtMSwgMTApO1xuICAgICAgICBhd2FpdCBleHBlY3QocmVzLnJvd3NbMF0udGl0bGUpLnRvLmJlLmVxdWFsKCd0ZXN0cycpO1xuICAgICB9KTtcbiAgICBpdCgnI2luaXRpYXRlRW5kcG9pbnRzKCknLCBhc3luYygpID0+IHtcbiAgICAgICAgYXdhaXQgcmVnaXN0cnkuYWRkRW5kcG9pbnQoJ3Rlc3RfZW5kcG9pbnRzJywgWzMsIDAsIDAsIDIsIDEwMDAwXSwgJ2FjYycpO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCByZWdpc3RyeS5xdWVyeVByb3ZpZGVyRW5kcG9pbnRzKDAsIC0xLCAxMCk7XG4gICAgICAgIGF3YWl0IGV4cGVjdChyZXMucm93c1swXS5zcGVjaWZpZXIpLnRvLmJlLmVxdWFsKCd0ZXN0X2VuZHBvaW50cycpO1xuICAgIH0pO1xufSk7XG4iXX0=