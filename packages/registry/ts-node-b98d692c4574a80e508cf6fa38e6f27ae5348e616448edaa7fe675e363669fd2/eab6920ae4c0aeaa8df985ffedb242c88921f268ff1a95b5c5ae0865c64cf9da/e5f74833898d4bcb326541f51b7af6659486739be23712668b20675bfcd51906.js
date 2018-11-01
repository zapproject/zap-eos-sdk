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
                const observer = new EventObserver();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9yZWdpc3RyeS9zcmMvdGVzdC90ZXN0LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL3JlZ2lzdHJ5L3NyYy90ZXN0L3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FDN0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ2hDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUM5QixNQUFNLENBQUM7QUFDUixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLG1DQUFxQztBQUVyQywrQ0FBZ0Q7QUFFaEQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBSTVDLDhCQUFvQyxJQUFjOztRQUM5QyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVELFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ2xCLE1BQU0sSUFBSSxHQUFJLElBQUksc0JBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDOUQsSUFBSSxRQUFhLENBQUM7SUFDbEIsTUFBTSxDQUFDLFVBQVUsSUFBSTtRQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLG9CQUFvQixDQUFDLEdBQVMsRUFBRTtZQUM1QixJQUFJO2dCQUNBLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsUUFBUSxHQUFHLE1BQU0sSUFBSSxjQUFRLENBQUM7b0JBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUMzQixJQUFJO2lCQUNMLENBQUMsQ0FBQztnQkFFSCxpQkFBdUIsSUFBUzs7d0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQ25CLENBQUM7aUJBQUE7Z0JBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDckMsUUFBUSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNqRDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUNuQyxJQUFJLEVBQUUsQ0FBQztRQUNQLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxHQUFRLEVBQUU7UUFDaEMsTUFBTSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4RCxNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDSixFQUFFLENBQUMsc0JBQXNCLEVBQUUsR0FBUSxFQUFFO1FBQ2pDLE1BQU0sUUFBUSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RSxNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3RFLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGV4cGVjdCA9IHJlcXVpcmUoJ2NoYWknKVxuLnVzZShyZXF1aXJlKCdjaGFpLWFzLXByb21pc2VkJykpXG4udXNlKHJlcXVpcmUoJ2NoYWktYmlnbnVtYmVyJykpXG4uZXhwZWN0O1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCB7IFJlZ3NpdHJ5IH0gZnJvbSBcIi4uLy4uL3NyY1wiO1xuaW1wb3J0IHsgQWNjb3VudCwgRGVwbG95ZXIgfSBmcm9tICdAemFwanMvZW9zLXV0aWxzJztcbmltcG9ydCB7IFRlc3ROb2RlIGFzIE5vZGV9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSBcIkB6YXBqcy9lb3MtdXRpbHNcIjtcbmNvbnN0IEV2ZW50T2JzZXJ2ZXIgPSByZXF1aXJlKCcuL2xpc3RlbmVyJyk7XG5cblxuXG5hc3luYyBmdW5jdGlvbiBjb25maWd1cmVFbnZpcm9ubWVudChmdW5jOiBGdW5jdGlvbikge1xuICAgIGF3YWl0IGZ1bmMoKTtcbn1cblxuZGVzY3JpYmUoJ1Rlc3QnLCAoKSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9ICBuZXcgTm9kZShmYWxzZSwgZmFsc2UsICdodHRwOi8vMTI3LjAuMC4xOjg4ODgnKTtcbiAgICBsZXQgcmVnaXN0cnk6IGFueTtcbiAgICBiZWZvcmUoZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdGhpcy50aW1lb3V0KDMwMDAwKTtcbiAgICAgICAgY29uZmlndXJlRW52aXJvbm1lbnQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBub2RlLmluaXQoKTtcbiAgICAgICAgICAgICAgICByZWdpc3RyeSA9IGF3YWl0IG5ldyBSZWdzaXRyeSh7XG4gICAgICAgICAgICAgICAgICBhY2NvdW50OiBub2RlLmdldFByb3ZpZGVyKCksXG4gICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhc3luYyBmdW5jdGlvbiBnZXRJbmZvKGluZm86IGFueSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaW5mbylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgRXZlbnRPYnNlcnZlcigpO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm9uKFwiemFwLm1haW46OmFkZGVuZHBvaW50XCIsIGdldEluZm8pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmxvZyhlKTsgfVxuICAgICAgICBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJyNpbml0aWF0ZVByb3ZpZGVyKCknLCBhc3luYygpID0+IHtcbiAgICAgICAgYXdhaXQgcmVnaXN0cnkuaW5pdGlhdGVQcm92aWRlcigndGVzdHMnLCAxMCk7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJlZ2lzdHJ5LnF1ZXJ5UHJvdmlkZXJMaXN0KDAsIC0xLCAxMCk7XG4gICAgICAgIGF3YWl0IGV4cGVjdChyZXMucm93c1swXS50aXRsZSkudG8uYmUuZXF1YWwoJ3Rlc3RzJyk7XG4gICAgIH0pO1xuICAgIGl0KCcjaW5pdGlhdGVFbmRwb2ludHMoKScsIGFzeW5jKCkgPT4ge1xuICAgICAgICBhd2FpdCByZWdpc3RyeS5hZGRFbmRwb2ludCgndGVzdF9lbmRwb2ludHMnLCBbMywgMCwgMCwgMiwgMTAwMDBdLCAnYWNjJyk7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJlZ2lzdHJ5LnF1ZXJ5UHJvdmlkZXJFbmRwb2ludHMoMCwgLTEsIDEwKTtcbiAgICAgICAgYXdhaXQgZXhwZWN0KHJlcy5yb3dzWzBdLnNwZWNpZmllcikudG8uYmUuZXF1YWwoJ3Rlc3RfZW5kcG9pbnRzJyk7XG4gICAgfSk7XG59KTtcbiJdfQ==