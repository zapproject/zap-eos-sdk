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
const eos_binaries_1 = require("@zapjs/eos-binaries");
//TODO: receive dynamically
const NODEOS_PATH = '/usr/local/bin/nodeos';
const EOS_DIR = '/home/user/eos';
const TOKEN_DIR = EOS_DIR + '/build/contracts/eosio.token';
const ACC_TEST_PRIV_KEY = '5KfFufnUThaEeqsSeMPt27Poan5g8LUaEorsC1hHm1FgNJfr3sX';
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
function findElement(array, field, value) {
    for (let i in array) {
        if (array.hasOwnProperty(i)) {
            if (array[i][field] === value) {
                return i;
            }
        }
    }
    return -1;
}
class TestNode extends eos_utils_1.Node {
    constructor(verbose, recompile, endpoint) {
        super({ verbose: verbose, key_provider: [ACC_TEST_PRIV_KEY, ACC_OWNER_PRIV_KEY], http_endpoint: 'http://127.0.0.1:8888', chain_id: '' });
        this.recompile = recompile;
        this.running = false;
        this.instance = null;
        this.nodeos_path = NODEOS_PATH;
        this.zap = this.getZapAccount();
        this.account_user = new eos_utils_1.Account('user');
        this.account_token = new eos_utils_1.Account('token');
        this.account_provider = new eos_utils_1.Account('provider');
        this.zap.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.account_user.usePrivateKey(ACC_TEST_PRIV_KEY);
        this.account_token.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.account_provider.usePrivateKey(ACC_TEST_PRIV_KEY);
    }
    getAccounts() {
        return {
            account_user: this.account_user,
            account_provider: this.account_provider,
            account_token: this.account_token,
            zap: this.zap
        };
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.instance) {
                throw new Error('Test EOS node is already running.');
            }
            // use spawn function because nodeos has infinity output
            this.instance = child_process_1.spawn(this.nodeos_path, ['-e -p eosio', '--delete-all-blocks', '--plugin eosio::producer_plugin', '--plugin eosio::history_plugin', '--plugin eosio::chain_api_plugin', '--plugin eosio::history_api_plugin', '--plugin eosio::http_plugin'], { shell: true });
            //this.instance = spawn('docker', ['run', 'eosio', '--delete-all-blocks']);
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
            yield this.deployToken(eos);
            yield this.grantPermissions(eos);
            return eos;
        });
    }
    registerAccounts(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            results.push(yield this.zap.register(eos));
            results.push(yield this.account_token.register(eos));
            results.push(yield this.account_provider.register(eos));
            results.push(yield this.account_user.register(eos));
            return results;
        });
    }
    deploy(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const deployer = new eos_utils_1.Deployer({ eos: eos, contract_name: 'main' });
            deployer.from(this.zap);
            deployer.abi(eos_binaries_1.Binaries.mainAbi);
            deployer.wasm(eos_binaries_1.Binaries.mainWasm);
            results.push(yield deployer.deploy());
            return results;
        });
    }
    deployToken(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const deployer = new eos_utils_1.Deployer({ eos: eos, contract_name: 'eosio.token' });
            let createTokenTransaction = new eos_utils_1.Transaction()
                .sender(this.account_token)
                .receiver(this.account_token)
                .action('create')
                .data({ issuer: this.account_token.name, maximum_supply: '1000000000 TST' });
            deployer.from(this.account_token);
            deployer.abi(eos_binaries_1.Binaries.tokenAbi);
            deployer.wasm(eos_binaries_1.Binaries.tokenWasm);
            deployer.afterDeploy(createTokenTransaction);
            results.push(yield deployer.deploy());
        });
    }
    grantPermissions(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            let newPermission = {
                permission: {
                    actor: 'zap.main',
                    permission: 'eosio.code'
                },
                weight: 1
            };
            let user = yield eos.getAccount(this.account_user.name);
            let main = yield eos.getAccount(this.zap.name);
            let newUserAuth = user.permissions[findElement(user.permissions, 'perm_name', 'active')];
            newUserAuth.required_auth.accounts.push(newPermission);
            let newMainAuth = main.permissions[findElement(main.permissions, 'perm_name', 'active')];
            newMainAuth.required_auth.accounts.push(newPermission);
            yield eos.transaction((tr) => {
                tr.updateauth({
                    account: user.account_name,
                    permission: 'active',
                    parent: 'owner',
                    auth: newUserAuth.required_auth
                }, { authorization: `${user.account_name}@owner` });
                tr.updateauth({
                    account: main.account_name,
                    permission: 'active',
                    parent: 'owner',
                    auth: newMainAuth.required_auth
                }, { authorization: `${main.account_name}@owner` });
            });
        });
    }
}
exports.TestNode = TestNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L2Vudmlyb25tZW50LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL2JvbmRhZ2Uvc3JjL3Rlc3QvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsZ0RBQThHO0FBQzlHLGlEQUFnRDtBQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNsRCxzREFBK0M7QUFJL0MsMkJBQTJCO0FBQzNCLE1BQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDO0FBQzVDLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQ2pDLE1BQU0sU0FBUyxHQUFHLE9BQU8sR0FBRyw4QkFBOEIsQ0FBQztBQUMzRCxNQUFNLGlCQUFpQixHQUFHLHFEQUFxRCxDQUFDO0FBQ2hGLE1BQU0sa0JBQWtCLEdBQUcscURBQXFELENBQUM7QUFJakYsbUJBQW1CLEtBQXNCLEVBQUUsSUFBWTtJQUNuRCxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU07UUFDdkMsa0JBQWtCLElBQVM7WUFDdkIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFDRCxxQkFBcUIsS0FBaUIsRUFBRSxLQUFhLEVBQUUsS0FBYTtJQUNoRSxLQUFL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LENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFdkQsTUFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBTyxFQUFFLEVBQUU7Z0JBQzVCLEVBQUUsQ0FBQyxVQUFVLENBQUM7b0JBQ1YsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMxQixVQUFVLEVBQUUsUUFBUTtvQkFDcEIsTUFBTSxFQUFFLE9BQU87b0JBQ2YsSUFBSSxFQUFFLFdBQVcsQ0FBQyxhQUFhO2lCQUNsQyxFQUFFLEVBQUMsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksUUFBUSxFQUFDLENBQUMsQ0FBQztnQkFHbkQsRUFBRSxDQUFDLFVBQVUsQ0FBQztvQkFDVCxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7b0JBQzFCLFVBQVUsRUFBRSxRQUFRO29CQUNwQixNQUFNLEVBQUUsT0FBTztvQkFDZixJQUFJLEVBQUUsV0FBVyxDQUFDLGFBQWE7aUJBQ2xDLEVBQUUsRUFBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0NBQ0o7QUF4SkQsNEJBd0pDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCB7IEFjY291bnQsIE5vZGUsIERlcGxveWVyLCBUcmFuc2FjdGlvbiwgU2ltcGxlRXZlbnRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyIH0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQgeyBzcGF3biwgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmNvbnN0IFBST0pFQ1RfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUgKyAnLy4uJyk7XG5pbXBvcnQgeyBCaW5hcmllcyB9IGZyb20gXCJAemFwanMvZW9zLWJpbmFyaWVzXCI7XG5pbXBvcnQgKiBhcyBzdHJlYW0gZnJvbSBcInN0cmVhbVwiO1xuXG5cbi8vVE9ETzogcmVjZWl2ZSBkeW5hbWljYWxseVxuY29uc3QgTk9ERU9TX1BBVEggPSAnL3Vzci9sb2NhbC9iaW4vbm9kZW9zJztcbmNvbnN0IEVPU19ESVIgPSAnL2hvbWUvdXNlci9lb3MnO1xuY29uc3QgVE9LRU5fRElSID0gRU9TX0RJUiArICcvYnVpbGQvY29udHJhY3RzL2Vvc2lvLnRva2VuJztcbmNvbnN0IEFDQ19URVNUX1BSSVZfS0VZID0gJzVLZkZ1Zm5VVGhhRWVxc1NlTVB0MjdQb2FuNWc4TFVhRW9yc0MxaEhtMUZnTkpmcjNzWCc7XG5jb25zdCBBQ0NfT1dORVJfUFJJVl9LRVkgPSAnNUtRd3JQYndkTDZQaFh1anhXMzdGU1NRWjFKaXdzU1Q0Y3FRekRleVh0UDc5emt2RkQzJztcblxuXG5cbmZ1bmN0aW9uIHdhaXRFdmVudChldmVudDogc3RyZWFtLlJlYWRhYmxlLCB0eXBlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKGRhdGE6IGFueSkge1xuICAgICAgICAgICAgZXZlbnQucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50Lm9uKHR5cGUsIGxpc3RlbmVyKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGZpbmRFbGVtZW50KGFycmF5OiBBcnJheTxhbnk+LCBmaWVsZDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgZm9yIChsZXQgaSBpbiBhcnJheSkge1xuICAgICAgICBpZiAoYXJyYXkuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIGlmIChhcnJheVtpXVtmaWVsZF0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG59XG5leHBvcnQgY2xhc3MgVGVzdE5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICByZWNvbXBpbGU6IGJvb2xlYW47XG4gICAgcnVubmluZzogYm9vbGVhbjtcbiAgICB6YXA6IEFjY291bnQ7XG4gICAgbm9kZW9zX3BhdGg6IHN0cmluZztcbiAgICBpbnN0YW5jZTogYW55O1xuICAgIGFjY291bnRfdXNlcjogQWNjb3VudDtcbiAgICBhY2NvdW50X3Rva2VuOiBBY2NvdW50O1xuICAgIGFjY291bnRfcHJvdmlkZXI6IEFjY291bnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcih2ZXJib3NlOiBib29sZWFuLCByZWNvbXBpbGU6IGJvb2xlYW4sIGVuZHBvaW50OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoe3ZlcmJvc2U6IHZlcmJvc2UsIGtleV9wcm92aWRlcjogW0FDQ19URVNUX1BSSVZfS0VZLCBBQ0NfT1dORVJfUFJJVl9LRVldLCBodHRwX2VuZHBvaW50OiAnaHR0cDovLzEyNy4wLjAuMTo4ODg4JywgY2hhaW5faWQ6ICcnfSk7XG4gICAgICAgIHRoaXMucmVjb21waWxlID0gcmVjb21waWxlO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XG4gICAgICAgIHRoaXMubm9kZW9zX3BhdGggPSBOT0RFT1NfUEFUSDtcbiAgICAgICAgdGhpcy56YXAgPSB0aGlzLmdldFphcEFjY291bnQoKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3VzZXIgPSBuZXcgQWNjb3VudCgndXNlcicpO1xuICAgICAgICB0aGlzLmFjY291bnRfdG9rZW4gPSBuZXcgQWNjb3VudCgndG9rZW4nKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3Byb3ZpZGVyID0gbmV3IEFjY291bnQoJ3Byb3ZpZGVyJyk7XG4gICAgICAgIHRoaXMuemFwLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3VzZXIudXNlUHJpdmF0ZUtleShBQ0NfVEVTVF9QUklWX0tFWSk7XG4gICAgICAgIHRoaXMuYWNjb3VudF90b2tlbi51c2VQcml2YXRlS2V5KEFDQ19PV05FUl9QUklWX0tFWSk7XG4gICAgICAgIHRoaXMuYWNjb3VudF9wcm92aWRlci51c2VQcml2YXRlS2V5KEFDQ19URVNUX1BSSVZfS0VZKTtcblxuICAgIH1cbiAgICBnZXRBY2NvdW50cygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFjY291bnRfdXNlcjogdGhpcy5hY2NvdW50X3VzZXIsXG4gICAgICAgICAgICBhY2NvdW50X3Byb3ZpZGVyOiB0aGlzLmFjY291bnRfcHJvdmlkZXIsXG4gICAgICAgICAgICBhY2NvdW50X3Rva2VuOiB0aGlzLmFjY291bnRfdG9rZW4sXG4gICAgICAgICAgICB6YXA6IHRoaXMuemFwXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXN0IEVPUyBub2RlIGlzIGFscmVhZHkgcnVubmluZy4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB1c2Ugc3Bhd24gZnVuY3Rpb24gYmVjYXVzZSBub2Rlb3MgaGFzIGluZmluaXR5IG91dHB1dFxuICAgICAgdGhpcy5pbnN0YW5jZSA9IHNwYXduKHRoaXMubm9kZW9zX3BhdGgsIFsnLWUgLXAgZW9zaW8nLCAnLS1kZWxldGUtYWxsLWJsb2NrcycsICctLXBsdWdpbiBlb3Npbzo6cHJvZHVjZXJfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpoaXN0b3J5X3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6Y2hhaW5fYXBpX3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6aGlzdG9yeV9hcGlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpodHRwX3BsdWdpbiddLCB7c2hlbGw6IHRydWV9KTtcbiAgICAgIC8vdGhpcy5pbnN0YW5jZSA9IHNwYXduKCdkb2NrZXInLCBbJ3J1bicsICdlb3NpbycsICctLWRlbGV0ZS1hbGwtYmxvY2tzJ10pO1xuXG4gICAgICAgIC8vIHdhaXQgdW50aWwgbm9kZSBpcyBydW5uaW5nXG5cbiAgICAgICAgd2hpbGUgKHRoaXMucnVubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGF3YWl0IHdhaXRFdmVudCh0aGlzLmluc3RhbmNlLnN0ZGVyciwgJ2RhdGEnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnZlcmJvc2UpIGNvbnNvbGUubG9nKCdFb3Mgbm9kZSBpcyBydW5uaW5nLicpXG4gICAgfVxuXG4gICAga2lsbCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2Uua2lsbCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZlcmJvc2UpIGNvbnNvbGUubG9nKCdFb3Mgbm9kZSBraWxsZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAgYXN5bmMgcmVzdGFydCgpIHtcbiAgICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgICAgYXdhaXQgdGhpcy5ydW4oKTtcbiAgICAgfVxuXG5cbiAgICBhc3luYyBpbml0KCkge1xuXG4gICAgICAgIGlmICghdGhpcy5ydW5uaW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VvcyBub2RlIG11c3QgcnVubmluZyByZWNlaXZlciBzZXR1cCBpbml0aWFsIHN0YXRlLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW9zID0gYXdhaXQgdGhpcy5jb25uZWN0KCk7XG4gICAgICAgIGF3YWl0IHRoaXMucmVnaXN0ZXJBY2NvdW50cyhlb3MpO1xuICAgICAgICBhd2FpdCB0aGlzLmRlcGxveShlb3MpO1xuICAgICAgICBhd2FpdCB0aGlzLmRlcGxveVRva2VuKGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuZ3JhbnRQZXJtaXNzaW9ucyhlb3MpO1xuICAgICAgICByZXR1cm4gZW9zO1xuICAgIH1cblxuXG4gICAgYXN5bmMgcmVnaXN0ZXJBY2NvdW50cyhlb3M6IGFueSkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCB0aGlzLnphcC5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuYWNjb3VudF90b2tlbi5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuYWNjb3VudF9wcm92aWRlci5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuYWNjb3VudF91c2VyLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBhc3luYyBkZXBsb3koZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGRlcGxveWVyID0gbmV3IERlcGxveWVyKHtlb3M6IGVvcywgY29udHJhY3RfbmFtZTogJ21haW4nfSk7XG4gICAgICAgIGRlcGxveWVyLmZyb20odGhpcy56YXApO1xuICAgICAgICBkZXBsb3llci5hYmkoQmluYXJpZXMubWFpbkFiaSk7XG4gICAgICAgIGRlcGxveWVyLndhc20oQmluYXJpZXMubWFpbldhc20pO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgZGVwbG95ZXIuZGVwbG95KCkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gICAgYXN5bmMgZGVwbG95VG9rZW4oZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGRlcGxveWVyID0gbmV3IERlcGxveWVyKHtlb3M6IGVvcywgY29udHJhY3RfbmFtZTogJ2Vvc2lvLnRva2VuJ30pO1xuICAgICAgICBsZXQgY3JlYXRlVG9rZW5UcmFuc2FjdGlvbiA9IG5ldyBUcmFuc2FjdGlvbigpXG4gICAgICAgICAgICAuc2VuZGVyKHRoaXMuYWNjb3VudF90b2tlbilcbiAgICAgICAgICAgIC5yZWNlaXZlcih0aGlzLmFjY291bnRfdG9rZW4pXG4gICAgICAgICAgICAuYWN0aW9uKCdjcmVhdGUnKVxuICAgICAgICAgICAgLmRhdGEoe2lzc3VlcjogdGhpcy5hY2NvdW50X3Rva2VuLm5hbWUsIG1heGltdW1fc3VwcGx5OiAnMTAwMDAwMDAwMCBUU1QnfSk7XG4gICAgICAgIGRlcGxveWVyLmZyb20odGhpcy5hY2NvdW50X3Rva2VuKTtcbiAgICAgICAgZGVwbG95ZXIuYWJpKEJpbmFyaWVzLnRva2VuQWJpKTtcbiAgICAgICAgZGVwbG95ZXIud2FzbShCaW5hcmllcy50b2tlbldhc20pO1xuICAgICAgICBkZXBsb3llci5hZnRlckRlcGxveShjcmVhdGVUb2tlblRyYW5zYWN0aW9uKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IGRlcGxveWVyLmRlcGxveSgpKTtcbiAgICB9XG4gICAgYXN5bmMgZ3JhbnRQZXJtaXNzaW9ucyhlb3M6IGFueSkge1xuICAgICAgICBsZXQgbmV3UGVybWlzc2lvbiA9IHtcbiAgICAgICAgICAgIHBlcm1pc3Npb246IHtcbiAgICAgICAgICAgICAgICBhY3RvcjogJ3phcC5tYWluJyxcbiAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnZW9zaW8uY29kZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3ZWlnaHQ6IDFcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgdXNlciA9IGF3YWl0IGVvcy5nZXRBY2NvdW50KHRoaXMuYWNjb3VudF91c2VyLm5hbWUpO1xuICAgICAgICBsZXQgbWFpbiA9IGF3YWl0IGVvcy5nZXRBY2NvdW50KHRoaXMuemFwLm5hbWUpO1xuXG4gICAgICAgIGxldCBuZXdVc2VyQXV0aCA9IHVzZXIucGVybWlzc2lvbnNbZmluZEVsZW1lbnQodXNlci5wZXJtaXNzaW9ucywgJ3Blcm1fbmFtZScsICdhY3RpdmUnKV07XG4gICAgICAgIG5ld1VzZXJBdXRoLnJlcXVpcmVkX2F1dGguYWNjb3VudHMucHVzaChuZXdQZXJtaXNzaW9uKTtcblxuICAgICAgICBsZXQgbmV3TWFpbkF1dGggPSBtYWluLnBlcm1pc3Npb25zW2ZpbmRFbGVtZW50KG1haW4ucGVybWlzc2lvbnMsICdwZXJtX25hbWUnLCAnYWN0aXZlJyldO1xuICAgICAgICBuZXdNYWluQXV0aC5yZXF1aXJlZF9hdXRoLmFjY291bnRzLnB1c2gobmV3UGVybWlzc2lvbik7XG5cbiAgICAgICAgYXdhaXQgZW9zLnRyYW5zYWN0aW9uKCh0cjogYW55KSA9PiB7XG4gICAgICAgICAgICAgIHRyLnVwZGF0ZWF1dGgoe1xuICAgICAgICAgICAgICAgICAgYWNjb3VudDogdXNlci5hY2NvdW50X25hbWUsXG4gICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogJ293bmVyJyxcbiAgICAgICAgICAgICAgICAgIGF1dGg6IG5ld1VzZXJBdXRoLnJlcXVpcmVkX2F1dGhcbiAgICAgICAgICAgICAgfSwge2F1dGhvcml6YXRpb246IGAke3VzZXIuYWNjb3VudF9uYW1lfUBvd25lcmB9KTtcblxuXG4gICAgICAgICAgICAgdHIudXBkYXRlYXV0aCh7XG4gICAgICAgICAgICAgICAgICBhY2NvdW50OiBtYWluLmFjY291bnRfbmFtZSxcbiAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb246ICdhY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgcGFyZW50OiAnb3duZXInLFxuICAgICAgICAgICAgICAgICAgYXV0aDogbmV3TWFpbkF1dGgucmVxdWlyZWRfYXV0aFxuICAgICAgICAgICAgICB9LCB7YXV0aG9yaXphdGlvbjogYCR7bWFpbi5hY2NvdW50X25hbWV9QG93bmVyYH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=