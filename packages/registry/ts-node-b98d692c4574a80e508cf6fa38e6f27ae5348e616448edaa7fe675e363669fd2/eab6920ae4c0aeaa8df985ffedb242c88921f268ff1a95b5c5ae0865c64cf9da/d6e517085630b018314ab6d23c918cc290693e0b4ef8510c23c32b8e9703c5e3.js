"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
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
const Utils = __importStar(require("@zapjs/eos-utils"));
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
                const observer = new Utils.Listener();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9yZWdpc3RyeS9zcmMvdGVzdC90ZXN0LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL3JlZ2lzdHJ5L3NyYy90ZXN0L3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQzdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixtQ0FBcUM7QUFFckMsK0NBQWdEO0FBQ2hELHdEQUEwQztBQUsxQyw4QkFBb0MsSUFBYzs7UUFDOUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztJQUNqQixDQUFDO0NBQUE7QUFFRCxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNsQixNQUFNLElBQUksR0FBSSxJQUFJLHNCQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0lBQzlELElBQUksUUFBYSxDQUFDO0lBQ2xCLE1BQU0sQ0FBQyxVQUFVLElBQUk7UUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQixvQkFBb0IsQ0FBQyxHQUFTLEVBQUU7WUFDNUIsSUFBSTtnQkFDQSxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLFFBQVEsR0FBRyxNQUFNLElBQUksY0FBUSxDQUFDO29CQUM1QixPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDM0IsSUFBSTtpQkFDTCxDQUFDLENBQUM7Z0JBRUgsaUJBQXVCLElBQVM7O3dCQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO29CQUNuQixDQUFDO2lCQUFBO2dCQUNELE1BQU0sUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN0QyxRQUFRLENBQUMsRUFBRSxDQUFDLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ2pEO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQ25DLElBQUksRUFBRSxDQUFDO1FBQ1AsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEdBQVEsRUFBRTtRQUNoQyxNQUFNLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEQsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNKLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxHQUFRLEVBQUU7UUFDakMsTUFBTSxRQUFRLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RCxNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDdEUsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhwZWN0ID0gcmVxdWlyZSgnY2hhaScpXG4udXNlKHJlcXVpcmUoJ2NoYWktYXMtcHJvbWlzZWQnKSlcbi51c2UocmVxdWlyZSgnY2hhaS1iaWdudW1iZXInKSlcbi5leHBlY3Q7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHsgUmVnc2l0cnkgfSBmcm9tIFwiLi4vLi4vc3JjXCI7XG5pbXBvcnQgeyBBY2NvdW50LCBEZXBsb3llciB9IGZyb20gJ0B6YXBqcy9lb3MtdXRpbHMnO1xuaW1wb3J0IHsgVGVzdE5vZGUgYXMgTm9kZX0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQgKiBhcyBVdGlscyBmcm9tIFwiQHphcGpzL2Vvcy11dGlsc1wiO1xuXG5cblxuXG5hc3luYyBmdW5jdGlvbiBjb25maWd1cmVFbnZpcm9ubWVudChmdW5jOiBGdW5jdGlvbikge1xuICAgIGF3YWl0IGZ1bmMoKTtcbn1cblxuZGVzY3JpYmUoJ1Rlc3QnLCAoKSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9ICBuZXcgTm9kZShmYWxzZSwgZmFsc2UsICdodHRwOi8vMTI3LjAuMC4xOjg4ODgnKTtcbiAgICBsZXQgcmVnaXN0cnk6IGFueTtcbiAgICBiZWZvcmUoZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdGhpcy50aW1lb3V0KDMwMDAwKTtcbiAgICAgICAgY29uZmlndXJlRW52aXJvbm1lbnQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLmluaXQoKTtcbiAgICAgICAgICAgICAgICByZWdpc3RyeSA9IGF3YWl0IG5ldyBSZWdzaXRyeSh7XG4gICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldFByb3ZpZGVyKCksXG4gICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhc3luYyBmdW5jdGlvbiBnZXRJbmZvKGluZm86IGFueSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaW5mbylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgVXRpbHMuTGlzdGVuZXIoKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5vbihcInphcC5tYWluOjphZGRlbmRwb2ludFwiLCBnZXRJbmZvKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgY29uc29sZS5sb2coZSk7IH1cbiAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCcjaW5pdGlhdGVQcm92aWRlcigpJywgYXN5bmMoKSA9PiB7XG4gICAgICAgIGF3YWl0IHJlZ2lzdHJ5LmluaXRpYXRlUHJvdmlkZXIoJ3Rlc3RzJywgMTApO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCByZWdpc3RyeS5xdWVyeVByb3ZpZGVyTGlzdCgwLCAtMSwgMTApO1xuICAgICAgICBhd2FpdCBleHBlY3QocmVzLnJvd3NbMF0udGl0bGUpLnRvLmJlLmVxdWFsKCd0ZXN0cycpO1xuICAgICB9KTtcbiAgICBpdCgnI2luaXRpYXRlRW5kcG9pbnRzKCknLCBhc3luYygpID0+IHtcbiAgICAgICAgYXdhaXQgcmVnaXN0cnkuYWRkRW5kcG9pbnQoJ3Rlc3RfZW5kcG9pbnRzJywgWzMsIDAsIDAsIDIsIDEwMDAwXSwgJ2FjYycpO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCByZWdpc3RyeS5xdWVyeVByb3ZpZGVyRW5kcG9pbnRzKDAsIC0xLCAxMCk7XG4gICAgICAgIGF3YWl0IGV4cGVjdChyZXMucm93c1swXS5zcGVjaWZpZXIpLnRvLmJlLmVxdWFsKCd0ZXN0X2VuZHBvaW50cycpO1xuICAgIH0pO1xufSk7XG4iXX0=