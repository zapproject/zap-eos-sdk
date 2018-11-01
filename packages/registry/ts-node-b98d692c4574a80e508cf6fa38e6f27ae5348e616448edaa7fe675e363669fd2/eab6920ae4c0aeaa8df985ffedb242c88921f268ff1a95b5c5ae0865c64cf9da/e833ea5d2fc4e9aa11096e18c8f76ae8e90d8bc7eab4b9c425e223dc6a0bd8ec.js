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
const path = require('path');
const fs = require('fs');
const eos_utils_1 = require("@zapjs/eos-utils");
const child_process_1 = require("child_process");
const PROJECT_PATH = path.join(__dirname + '/..');
//TODO: receive dynamically
const NODEOS_PATH = '/home/user/eos/build/programs/nodeos/nodeos';
const EOS_DIR = '/home/user/eos';
const ACC_TEST_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const ACC_OWNER_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
function waitEvent(event, type) {
    return new Promise(function (resolve, reject) {
        function listener(data) {
            event.removeListener(type, listener);
            resolve(data);
        }
        event.on(type, listener);
    });
}
class TestNode extends eos_utils_1.Node {
    constructor(verbose, recompile, endpoint) {
        super({ verbose: verbose, key_provider: [ACC_TEST_PRIV_KEY, ACC_OWNER_PRIV_KEY], http_endpoint: 'http://127.0.0.1:8888', chain_id: '' });
        this.recompile = recompile;
        this.running = false;
        this.instance = null;
        this.nodeos_path = NODEOS_PATH;
        this.provider = new eos_utils_1.Account('zap.provider');
        this.provider.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.zap = this.getZapAccount();
        this.zap.usePrivateKey(ACC_OWNER_PRIV_KEY);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.instance) {
                throw new Error('Test EOS node is already running.');
            }
            // use spawn function because nodeos has infinity output
            this.instance = child_process_1.spawn(this.nodeos_path, ['-e -p eosio', '--delete-all-blocks', '--plugin eosio::producer_plugin', '--plugin eosio::history_plugin', '--plugin eosio::chain_api_plugin', '--plugin eosio::history_api_plugin', '--plugin eosio::http_plugin'], { shell: true });
            // wait until node is running
            while (this.running === false) {
                yield waitEvent(this.instance.stderr, 'data');
                if (this.running === false) {
                    this.running = true;
                }
            }
            if (this.verbose)
                console.log('Eos node is running.');
        });
    }
    kill() {
        if (this.instance) {
            this.instance.kill();
            this.instance = null;
            this.running = false;
            if (this.verbose)
                console.log('Eos node killed.');
        }
    }
    restart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.kill();
            yield this.run();
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.running) {
                throw new Error('Eos node must running receiver setup initial state.');
            }
            const eos = yield this.connect();
            yield this.registerAccounts(eos);
            yield this.deploy(eos);
        });
    }
    registerAccounts(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            results.push(yield this.provider.register(eos));
            results.push(yield this.zap.register(eos));
            return results;
        });
    }
    deploy(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const abi = fs.readFileSync(path.resolve(__dirname, '..', '..', 'contract/main.abi'));
            const wasm = fs.readFileSync(path.resolve(__dirname, '..', '..', 'contract/main.wasm'));
            const deployer = new eos_utils_1.Deployer({ eos: eos, contract_name: 'main' });
            deployer.from(this.zap);
            deployer.abi(abi);
            deployer.wasm(wasm);
            results.push(yield deployer.deploy());
            return results;
        });
    }
    getProvider() {
        return this.provider;
    }
}
exports.TestNode = TestNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9yZWdpc3RyeS9zcmMvdGVzdC9lbnZpcm9ubWVudC50cyIsInNvdXJjZXMiOlsiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9yZWdpc3RyeS9zcmMvdGVzdC9lbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixnREFBOEc7QUFDOUcsaURBQWdEO0FBQ2hELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBSWxELDJCQUEyQjtBQUMzQixNQUFNLFdBQVcsR0FBRyw2Q0FBNkMsQ0FBQztBQUNsRSxNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQztBQUVqQyxNQUFNLGlCQUFpQixHQUFHLHFEQUFxRCxDQUFDO0FBQ2hGLE1BQU0sa0JBQWtCLEdBQUcscURBQXFELENBQUM7QUFJakYsbUJBQW1CLEtBQXNCLEVBQUUsSUFBWTtJQUNuRCxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU07UUFDdkMsa0JBQWtCLElBQVM7WUFDdkIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxjQUFzQixTQUFRLGdCQUFJO0lBUTlCLFlBQVksT0FBZ0IsRUFBRSxTQUFrQixFQUFFLFFBQWdCO1FBQzlELEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUs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SSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzQyxPQUFPLE9BQU8sQ0FBQztRQUNuQixDQUFDO0tBQUE7SUFFSyxNQUFNLENBQUMsR0FBUTs7WUFDakIsTUFBTSxPQUFPLEdBQVEsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUN4RixNQUFNLFFBQVEsR0FBRyxJQUFJLG9CQUFRLENBQUMsRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1lBQ2pFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDdEMsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQztLQUFBO0lBQ0QsV0FBVztRQUNQLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0NBQ0o7QUF0RkQsNEJBc0ZDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCB7IEFjY291bnQsIE5vZGUsIERlcGxveWVyLCBUcmFuc2FjdGlvbiwgU2ltcGxlRXZlbnRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyIH0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQgeyBzcGF3biwgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmNvbnN0IFBST0pFQ1RfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUgKyAnLy4uJyk7XG5pbXBvcnQgKiBhcyBzdHJlYW0gZnJvbSBcInN0cmVhbVwiO1xuXG5cbi8vVE9ETzogcmVjZWl2ZSBkeW5hbWljYWxseVxuY29uc3QgTk9ERU9TX1BBVEggPSAnL2hvbWUvdXNlci9lb3MvYnVpbGQvcHJvZ3JhbXMvbm9kZW9zL25vZGVvcyc7XG5jb25zdCBFT1NfRElSID0gJy9ob21lL3VzZXIvZW9zJztcblxuY29uc3QgQUNDX1RFU1RfUFJJVl9LRVkgPSAnNUtRd3JQYndkTDZQaFh1anhXMzdGU1NRWjFKaXdzU1Q0Y3FRekRleVh0UDc5emt2RkQzJztcbmNvbnN0IEFDQ19PV05FUl9QUklWX0tFWSA9ICc1S1F3clBid2RMNlBoWHVqeFczN0ZTU1FaMUppd3NTVDRjcVF6RGV5WHRQNzl6a3ZGRDMnO1xuXG5cblxuZnVuY3Rpb24gd2FpdEV2ZW50KGV2ZW50OiBzdHJlYW0uUmVhZGFibGUsIHR5cGU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gbGlzdGVuZXIoZGF0YTogYW55KSB7XG4gICAgICAgICAgICBldmVudC5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnQub24odHlwZSwgbGlzdGVuZXIpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgY2xhc3MgVGVzdE5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICByZWNvbXBpbGU6IGJvb2xlYW47XG4gICAgcnVubmluZzogYm9vbGVhbjtcbiAgICBwcm92aWRlcjogQWNjb3VudDtcbiAgICB6YXA6IEFjY291bnQ7XG4gICAgbm9kZW9zX3BhdGg6IHN0cmluZztcbiAgICBpbnN0YW5jZTogYW55O1xuXG4gICAgY29uc3RydWN0b3IodmVyYm9zZTogYm9vbGVhbiwgcmVjb21waWxlOiBib29sZWFuLCBlbmRwb2ludDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHt2ZXJib3NlOiB2ZXJib3NlLCBrZXlfcHJvdmlkZXI6IFtBQ0NfVEVTVF9QUklWX0tFWSwgQUNDX09XTkVSX1BSSVZfS0VZXSwgaHR0cF9lbmRwb2ludDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODg4OCcsIGNoYWluX2lkOiAnJ30pO1xuICAgICAgICB0aGlzLnJlY29tcGlsZSA9IHJlY29tcGlsZTtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICB0aGlzLm5vZGVvc19wYXRoID0gTk9ERU9TX1BBVEg7XG4gICAgICAgIHRoaXMucHJvdmlkZXIgPSBuZXcgQWNjb3VudCgnemFwLnByb3ZpZGVyJyk7XG4gICAgICAgIHRoaXMucHJvdmlkZXIudXNlUHJpdmF0ZUtleShBQ0NfT1dORVJfUFJJVl9LRVkpO1xuICAgICAgICB0aGlzLnphcCA9IHRoaXMuZ2V0WmFwQWNjb3VudCgpO1xuICAgICAgICB0aGlzLnphcC51c2VQcml2YXRlS2V5KEFDQ19PV05FUl9QUklWX0tFWSk7XG4gICAgfVxuICAgIGFzeW5jIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVzdCBFT1Mgbm9kZSBpcyBhbHJlYWR5IHJ1bm5pbmcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdXNlIHNwYXduIGZ1bmN0aW9uIGJlY2F1c2Ugbm9kZW9zIGhhcyBpbmZpbml0eSBvdXRwdXRcblxuICAgICAgICB0aGlzLmluc3RhbmNlID0gc3Bhd24odGhpcy5ub2Rlb3NfcGF0aCwgWyctZSAtcCBlb3NpbycsICctLWRlbGV0ZS1hbGwtYmxvY2tzJywgJy0tcGx1Z2luIGVvc2lvOjpwcm9kdWNlcl9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omhpc3RvcnlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpjaGFpbl9hcGlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpoaXN0b3J5X2FwaV9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omh0dHBfcGx1Z2luJ10sIHtzaGVsbDogdHJ1ZX0pO1xuICAgICAgICAvLyB3YWl0IHVudGlsIG5vZGUgaXMgcnVubmluZ1xuXG4gICAgICAgIHdoaWxlICh0aGlzLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBhd2FpdCB3YWl0RXZlbnQodGhpcy5pbnN0YW5jZS5zdGRlcnIsICdkYXRhJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucnVubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy52ZXJib3NlKSBjb25zb2xlLmxvZygnRW9zIG5vZGUgaXMgcnVubmluZy4nKVxuICAgIH1cblxuICAgIGtpbGwoKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLmtpbGwoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52ZXJib3NlKSBjb25zb2xlLmxvZygnRW9zIG5vZGUga2lsbGVkLicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgIGFzeW5jIHJlc3RhcnQoKSB7XG4gICAgICAgICB0aGlzLmtpbGwoKTtcbiAgICAgICAgIGF3YWl0IHRoaXMucnVuKCk7XG4gICAgIH1cblxuXG4gICAgYXN5bmMgaW5pdCgpIHtcblxuICAgICAgICBpZiAoIXRoaXMucnVubmluZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFb3Mgbm9kZSBtdXN0IHJ1bm5pbmcgcmVjZWl2ZXIgc2V0dXAgaW5pdGlhbCBzdGF0ZS4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVvcyA9IGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuICAgICAgICBhd2FpdCB0aGlzLnJlZ2lzdGVyQWNjb3VudHMoZW9zKTtcbiAgICAgICAgYXdhaXQgdGhpcy5kZXBsb3koZW9zKTtcbiAgICB9XG5cblxuICAgIGFzeW5jIHJlZ2lzdGVyQWNjb3VudHMoZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy5wcm92aWRlci5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuemFwLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBhc3luYyBkZXBsb3koZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGFiaSA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnY29udHJhY3QvbWFpbi5hYmknKSk7XG4gICAgICAgIGNvbnN0IHdhc20gPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJy4uJywgJ2NvbnRyYWN0L21haW4ud2FzbScpKTtcbiAgICAgICAgY29uc3QgZGVwbG95ZXIgPSBuZXcgRGVwbG95ZXIoe2VvczogZW9zLCBjb250cmFjdF9uYW1lOiAnbWFpbid9KTtcbiAgICAgICAgZGVwbG95ZXIuZnJvbSh0aGlzLnphcCk7XG4gICAgICAgIGRlcGxveWVyLmFiaShhYmkpO1xuICAgICAgICBkZXBsb3llci53YXNtKHdhc20pO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgZGVwbG95ZXIuZGVwbG95KCkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gICAgZ2V0UHJvdmlkZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3ZpZGVyO1xuICAgIH1cbn1cbiJdfQ==