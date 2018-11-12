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
const minting_1 = require("../../src/minting");
const environment_1 = require("./environment");
function configureEnvironment(func) {
    return __awaiter(this, void 0, void 0, function* () {
        yield func();
    });
}
//PW5KZEbYJLwbSPr8buQy1Uki5WVS8HLcz1VcpWik5Mba4os4RpPwc
describe('Test', () => {
    const node = new environment_1.TestNode(false, false, 'http://127.0.0.1:8888');
    let minting;
    before(function (done) {
        this.timeout(30000);
        configureEnvironment(() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield node.restart();
                yield node.init();
                minting = yield new minting_1.tokenMinting(node.getAccounts().zap, node);
            }
            catch (e) {
                console.log(e);
            }
            done();
        }));
    });
    it('#issueTokens()', () => __awaiter(this, void 0, void 0, function* () {
        const eos = yield node.connect();
        yield minting.issueTokens([{ id: 'user', quantity: '10000 TST' }], 'hi');
        let tokensAmount = yield eos.getCurrencyBalance('zap.main', 'user', 'TST');
        yield expect(tokensAmount[0].toString()).to.be.equal('10000 TST');
    }));
    it('#transferTokens()', () => __awaiter(this, void 0, void 0, function* () {
        const eos = yield node.connect();
        yield minting.transferTokens(node.getAccounts().account_user, ['receiver', 'main'], '7 TST', 'hi');
        let tokensAmountA = yield eos.getCurrencyBalance(node.getAccounts().zap.name, 'receiver', 'TST');
        yield expect(tokensAmountA[0].toString()).to.be.equal('7 TST');
        let tokensAmountB = yield eos.getCurrencyBalance(node.getAccounts().zap.name, 'main', 'TST');
        yield expect(tokensAmountB[0].toString()).to.be.equal('7 TST');
        let restTokensAmount = yield eos.getCurrencyBalance(node.getAccounts().zap.name, 'user', 'TST');
        yield expect(restTokensAmount[0].toString()).to.be.equal('9986 TST');
    }));
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9taW50aW5nL3NyYy90ZXN0L3Rlc3QudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvbWludGluZy9zcmMvdGVzdC90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQ3pCLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDOUIsTUFBTSxDQUFDO0FBQ1osTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QiwrQ0FBK0M7QUFFL0MsK0NBQStDO0FBSS9DLDhCQUFvQyxJQUFjOztRQUM5QyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQUVELHVEQUF1RDtBQUd2RCxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNsQixNQUFNLElBQUksR0FBRyxJQUFJLHNCQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0lBQzdELElBQUksT0FBWSxDQUFDO0lBRWpCLE1BQU0sQ0FBQyxVQUFVLElBQUk7UUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQixvQkFBb0IsQ0FBQyxHQUFTLEVBQUU7WUFDNUIsSUFBSTtnQkFDQSxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xCLE9BQU8sR0FBRyxNQUFNLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ2xFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsQjtZQUNELElBQUksRUFBRSxDQUFDO1FBQ1gsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLGdCQUFnQixFQUFFLEdBQVMsRUFBRTtRQUM1QixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQyxNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkUsSUFBSSxZQUFZLEdBQUcsTUFBTSxHQUFHLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzRSxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN0RSxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEdBQVMsRUFBRTtRQUMvQixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQyxNQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkcsSUFBSSxhQUFhLEdBQUcsTUFBTSxHQUFHLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pHLE1BQU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELElBQUksYUFBYSxHQUFHLE1BQU0sR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3RixNQUFNLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvRCxJQUFJLGdCQUFnQixHQUFHLE1BQU0sR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRyxNQUFNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3pFLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGV4cGVjdCA9IHJlcXVpcmUoJ2NoYWknKVxuICAgIC51c2UocmVxdWlyZSgnY2hhaS1hcy1wcm9taXNlZCcpKVxuICAgIC51c2UocmVxdWlyZSgnY2hhaS1iaWdudW1iZXInKSlcbiAgICAuZXhwZWN0O1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCB7dG9rZW5NaW50aW5nfSBmcm9tIFwiLi4vLi4vc3JjL21pbnRpbmdcIjtcbmltcG9ydCB7QWNjb3VudCwgRGVwbG95ZXJ9IGZyb20gJ0B6YXBqcy9lb3MtdXRpbHMnO1xuaW1wb3J0IHtUZXN0Tm9kZSBhcyBOb2RlfSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gXCJAemFwanMvZW9zLXV0aWxzXCI7XG5cblxuYXN5bmMgZnVuY3Rpb24gY29uZmlndXJlRW52aXJvbm1lbnQoZnVuYzogRnVuY3Rpb24pIHtcbiAgICBhd2FpdCBmdW5jKCk7XG59XG5cbi8vUFc1S1pFYllKTHdiU1ByOGJ1UXkxVWtpNVdWUzhITGN6MVZjcFdpazVNYmE0b3M0UnBQd2NcblxuXG5kZXNjcmliZSgnVGVzdCcsICgpID0+IHtcbiAgICBjb25zdCBub2RlID0gbmV3IE5vZGUoZmFsc2UsIGZhbHNlLCAnaHR0cDovLzEyNy4wLjAuMTo4ODg4Jyk7XG4gICAgbGV0IG1pbnRpbmc6IGFueTtcblxuICAgIGJlZm9yZShmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB0aGlzLnRpbWVvdXQoMzAwMDApO1xuICAgICAgICBjb25maWd1cmVFbnZpcm9ubWVudChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IG5vZGUucmVzdGFydCgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IG5vZGUuaW5pdCgpO1xuICAgICAgICAgICAgICAgIG1pbnRpbmcgPSBhd2FpdCBuZXcgdG9rZW5NaW50aW5nKG5vZGUuZ2V0QWNjb3VudHMoKS56YXAsIG5vZGUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCcjaXNzdWVUb2tlbnMoKScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgZW9zID0gYXdhaXQgbm9kZS5jb25uZWN0KCk7XG4gICAgICAgIGF3YWl0IG1pbnRpbmcuaXNzdWVUb2tlbnMoW3tpZDogJ3VzZXInLCBxdWFudGl0eTogJzEwMDAwIFRTVCd9XSwgJ2hpJyk7XG4gICAgICAgIGxldCB0b2tlbnNBbW91bnQgPSBhd2FpdCBlb3MuZ2V0Q3VycmVuY3lCYWxhbmNlKCd6YXAubWFpbicsICd1c2VyJywgJ1RTVCcpO1xuICAgICAgICBhd2FpdCBleHBlY3QodG9rZW5zQW1vdW50WzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxdWFsKCcxMDAwMCBUU1QnKTtcbiAgICB9KTtcblxuICAgIGl0KCcjdHJhbnNmZXJUb2tlbnMoKScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgZW9zID0gYXdhaXQgbm9kZS5jb25uZWN0KCk7XG4gICAgICAgIGF3YWl0IG1pbnRpbmcudHJhbnNmZXJUb2tlbnMobm9kZS5nZXRBY2NvdW50cygpLmFjY291bnRfdXNlciwgWydyZWNlaXZlcicsICdtYWluJ10sICc3IFRTVCcsICdoaScpO1xuICAgICAgICBsZXQgdG9rZW5zQW1vdW50QSA9IGF3YWl0IGVvcy5nZXRDdXJyZW5jeUJhbGFuY2Uobm9kZS5nZXRBY2NvdW50cygpLnphcC5uYW1lLCAncmVjZWl2ZXInLCAnVFNUJyk7XG4gICAgICAgIGF3YWl0IGV4cGVjdCh0b2tlbnNBbW91bnRBWzBdLnRvU3RyaW5nKCkpLnRvLmJlLmVxdWFsKCc3IFRTVCcpO1xuICAgICAgICBsZXQgdG9rZW5zQW1vdW50QiA9IGF3YWl0IGVvcy5nZXRDdXJyZW5jeUJhbGFuY2Uobm9kZS5nZXRBY2NvdW50cygpLnphcC5uYW1lLCAnbWFpbicsICdUU1QnKTtcbiAgICAgICAgYXdhaXQgZXhwZWN0KHRva2Vuc0Ftb3VudEJbMF0udG9TdHJpbmcoKSkudG8uYmUuZXF1YWwoJzcgVFNUJyk7XG4gICAgICAgIGxldCByZXN0VG9rZW5zQW1vdW50ID0gYXdhaXQgZW9zLmdldEN1cnJlbmN5QmFsYW5jZShub2RlLmdldEFjY291bnRzKCkuemFwLm5hbWUsICd1c2VyJywgJ1RTVCcpO1xuICAgICAgICBhd2FpdCBleHBlY3QocmVzdFRva2Vuc0Ftb3VudFswXS50b1N0cmluZygpKS50by5iZS5lcXVhbCgnOTk4NiBUU1QnKTtcbiAgICB9KTtcbn0pO1xuIl19