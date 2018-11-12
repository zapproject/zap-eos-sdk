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
const NODEOS_PATH = '/usr/local/bin/nodeos'; //'/home/user/eos/build/programs/nodeos/nodeos';
const EOS_DIR = '/home/user/eos';
const TOKEN_DIR = EOS_DIR + '/build/contracts/eosio.token';
const ACC_TEST_PRIV_KEY = '5KfFufnUThaEeqsSeMPt27Poan5g8LUaEorsC1hHm1FgNJfr3sX';
//const ACC_TEST_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
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
        super({
            verbose: verbose,
            key_provider: [ACC_TEST_PRIV_KEY, ACC_OWNER_PRIV_KEY],
            http_endpoint: 'http://127.0.0.1:8888',
            chain_id: ''
        });
        this.recompile = recompile;
        this.running = false;
        this.instance = null;
        this.nodeos_path = NODEOS_PATH;
        this.provider = new eos_utils_1.Account('zap.provider').usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.zap = this.getZapAccount().usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.user = new eos_utils_1.Account('user').usePrivateKey(ACC_TEST_PRIV_KEY);
        this.token = new eos_utils_1.Account('zap.token').usePrivateKey(ACC_OWNER_PRIV_KEY);
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
            yield this.issueTokens(eos);
            yield this.grantPermissions(eos);
        });
    }
    registerAccounts(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            results.push(yield this.provider.register(eos));
            results.push(yield this.zap.register(eos));
            results.push(yield this.token.register(eos));
            results.push(yield this.user.register(eos));
            return results;
        });
    }
    issueTokens(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new eos_utils_1.Transaction()
                .sender(this.token)
                .receiver(this.token)
                .action('issue')
                .data({ to: this.user.name, quantity: '1000000 TST', memo: '' })
                .execute(eos);
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
            let createTokenTransaction = new eos_utils_1.Transaction()
                .sender(this.token)
                .receiver(this.token)
                .action('create')
                .data({ issuer: this.token.name, maximum_supply: '1000000000 TST' });
            results.push(yield new eos_utils_1.Deployer({ eos: eos, contract_name: 'eosio.token' })
                .from(this.token)
                .abi(eos_binaries_1.Binaries.tokenAbi)
                .wasm(eos_binaries_1.Binaries.tokenWasm)
                .afterDeploy(createTokenTransaction)
                .deploy());
            return results;
        });
    }
    grantPermissions(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            let newPermission = {
                permission: {
                    actor: this.zap.name,
                    permission: 'eosio.code'
                },
                weight: 1
            };
            let user = yield eos.getAccount(this.user.name);
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
    getProviderAccount() {
        return this.provider;
    }
    getUserAccount() {
        return this.user;
    }
}
exports.TestNode = TestNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9kaXNwYXRjaC9zcmMvdGVzdC9lbnZpcm9ubWVudC50cyIsInNvdXJjZXMiOlsiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9kaXNwYXRjaC9zcmMvdGVzdC9lbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixnREFBNEc7QUFDNUcsaURBQThDO0FBRTlDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBR2xELHNEQUErQztBQUcvQyxNQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQyxDQUFBLGdEQUFnRDtBQUM1RixNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQztBQUNqQyxNQUFNLFNBQVMsR0FBRyxPQUFPLEdBQUcsOEJBQThCLENBQUM7QUFDM0QsTUFBTSxpQkFBaUIsR0FBRyxxREFBcUQsQ0FBQztBQUNoRixrRkFBa0Y7QUFDbEYsTUFBTSxrQkFBa0IsR0FBRyxxREFBcUQsQ0FBQztBQUlqRixtQkFBbUIsS0FBc0IsRUFBRSxJQUFZO0lBQ25ELE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtRQUN4QyxrQkFBa0IsSUFBUztZQUN2QixLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQztRQUVELEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELHFCQUFxQixLQUFpQixFQUFFLEtBQWEsRUFBRSxL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QUFVLENBQUM7b0JBQ1YsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMxQixVQUFVLEVBQUUsUUFBUTtvQkFDcEIsTUFBTSxFQUFFLE9BQU87b0JBQ2YsSUFBSSxFQUFFLFdBQVcsQ0FBQyxhQUFhO2lCQUNsQyxFQUFFLEVBQUMsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksUUFBUSxFQUFDLENBQUMsQ0FBQztnQkFFbEQsRUFBRSxDQUFDLFVBQVUsQ0FBQztvQkFDVixPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7b0JBQzFCLFVBQVUsRUFBRSxRQUFRO29CQUNwQixNQUFNLEVBQUUsT0FBTztvQkFDZixJQUFJLEVBQUUsV0FBVyxDQUFDLGFBQWE7aUJBQ2xDLEVBQUUsRUFBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ3RELENBQUMsQ0FDSixDQUFDO1FBQ04sQ0FBQztLQUFBO0lBRUQsa0JBQWtCO1FBQ2QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxjQUFjO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7Q0FDSjtBQWpLRCw0QkFpS0MiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHtBY2NvdW50LCBOb2RlLCBEZXBsb3llciwgVHJhbnNhY3Rpb24sIFNpbXBsZUV2ZW50TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcn0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQge3NwYXduLCBleGVjU3luY30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IFBST0pFQ1RfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUgKyAnLy4uJyk7XG5pbXBvcnQgKiBhcyBzdHJlYW0gZnJvbSBcInN0cmVhbVwiO1xuXG5pbXBvcnQgeyBCaW5hcmllcyB9IGZyb20gXCJAemFwanMvZW9zLWJpbmFyaWVzXCI7XG5cblxuY29uc3QgTk9ERU9TX1BBVEggPSAnL3Vzci9sb2NhbC9iaW4vbm9kZW9zJzsvLycvaG9tZS91c2VyL2Vvcy9idWlsZC9wcm9ncmFtcy9ub2Rlb3Mvbm9kZW9zJztcbmNvbnN0IEVPU19ESVIgPSAnL2hvbWUvdXNlci9lb3MnO1xuY29uc3QgVE9LRU5fRElSID0gRU9TX0RJUiArICcvYnVpbGQvY29udHJhY3RzL2Vvc2lvLnRva2VuJztcbmNvbnN0IEFDQ19URVNUX1BSSVZfS0VZID0gJzVLZkZ1Zm5VVGhhRWVxc1NlTVB0MjdQb2FuNWc4TFVhRW9yc0MxaEhtMUZnTkpmcjNzWCc7XG4vL2NvbnN0IEFDQ19URVNUX1BSSVZfS0VZID0gJzVLUXdyUGJ3ZEw2UGhYdWp4VzM3RlNTUVoxSml3c1NUNGNxUXpEZXlYdFA3OXprdkZEMyc7XG5jb25zdCBBQ0NfT1dORVJfUFJJVl9LRVkgPSAnNUtRd3JQYndkTDZQaFh1anhXMzdGU1NRWjFKaXdzU1Q0Y3FRekRleVh0UDc5emt2RkQzJztcblxuXG5cbmZ1bmN0aW9uIHdhaXRFdmVudChldmVudDogc3RyZWFtLlJlYWRhYmxlLCB0eXBlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcihkYXRhOiBhbnkpIHtcbiAgICAgICAgICAgIGV2ZW50LnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBldmVudC5vbih0eXBlLCBsaXN0ZW5lcik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGZpbmRFbGVtZW50KGFycmF5OiBBcnJheTxhbnk+LCBmaWVsZDogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgZm9yIChsZXQgaSBpbiBhcnJheSkge1xuICAgICAgICBpZiAoYXJyYXkuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIGlmIChhcnJheVtpXVtmaWVsZF0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG59XG5cbmV4cG9ydCBjbGFzcyBUZXN0Tm9kZSBleHRlbmRzIE5vZGUge1xuICAgIHJlY29tcGlsZTogYm9vbGVhbjtcbiAgICBydW5uaW5nOiBib29sZWFuO1xuICAgIHByb3ZpZGVyOiBBY2NvdW50O1xuICAgIHphcDogQWNjb3VudDtcbiAgICBub2Rlb3NfcGF0aDogc3RyaW5nO1xuICAgIGluc3RhbmNlOiBhbnk7XG4gICAgdXNlcjogQWNjb3VudDtcbiAgICB0b2tlbjogQWNjb3VudDtcblxuICAgIGNvbnN0cnVjdG9yKHZlcmJvc2U6IGJvb2xlYW4sIHJlY29tcGlsZTogYm9vbGVhbiwgZW5kcG9pbnQ6IHN0cmluZykge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICB2ZXJib3NlOiB2ZXJib3NlLFxuICAgICAgICAgICAga2V5X3Byb3ZpZGVyOiBbQUNDX1RFU1RfUFJJVl9LRVksIEFDQ19PV05FUl9QUklWX0tFWV0sXG4gICAgICAgICAgICBodHRwX2VuZHBvaW50OiAnaHR0cDovLzEyNy4wLjAuMTo4ODg4JyxcbiAgICAgICAgICAgIGNoYWluX2lkOiAnJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWNvbXBpbGUgPSByZWNvbXBpbGU7XG4gICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5ub2Rlb3NfcGF0aCA9IE5PREVPU19QQVRIO1xuICAgICAgICB0aGlzLnByb3ZpZGVyID0gbmV3IEFjY291bnQoJ3phcC5wcm92aWRlcicpLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy56YXAgPSB0aGlzLmdldFphcEFjY291bnQoKS51c2VQcml2YXRlS2V5KEFDQ19PV05FUl9QUklWX0tFWSk7XG4gICAgICAgIHRoaXMudXNlciA9IG5ldyBBY2NvdW50KCd1c2VyJykudXNlUHJpdmF0ZUtleShBQ0NfVEVTVF9QUklWX0tFWSk7XG4gICAgICAgIHRoaXMudG9rZW4gPSBuZXcgQWNjb3VudCgnemFwLnRva2VuJykudXNlUHJpdmF0ZUtleShBQ0NfT1dORVJfUFJJVl9LRVkpO1xuICAgIH1cblxuICAgIGFzeW5jIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVzdCBFT1Mgbm9kZSBpcyBhbHJlYWR5IHJ1bm5pbmcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdXNlIHNwYXduIGZ1bmN0aW9uIGJlY2F1c2Ugbm9kZW9zIGhhcyBpbmZpbml0eSBvdXRwdXRcbiAgICAgICAgdGhpcy5pbnN0YW5jZSA9IHNwYXduKHRoaXMubm9kZW9zX3BhdGgsIFsnLWUgLXAgZW9zaW8nLCAnLS1kZWxldGUtYWxsLWJsb2NrcycsICctLXBsdWdpbiBlb3Npbzo6cHJvZHVjZXJfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpoaXN0b3J5X3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6Y2hhaW5fYXBpX3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6aGlzdG9yeV9hcGlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpodHRwX3BsdWdpbiddLCB7c2hlbGw6IHRydWV9KTtcbiAgICAgICAgLy8gd2FpdCB1bnRpbCBub2RlIGlzIHJ1bm5pbmdcblxuICAgICAgICB3aGlsZSAodGhpcy5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYXdhaXQgd2FpdEV2ZW50KHRoaXMuaW5zdGFuY2Uuc3RkZXJyLCAnZGF0YScpO1xuICAgICAgICAgICAgaWYgKHRoaXMucnVubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudmVyYm9zZSkgY29uc29sZS5sb2coJ0VvcyBub2RlIGlzIHJ1bm5pbmcuJylcbiAgICB9XG5cbiAgICBraWxsKCkge1xuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5raWxsKCk7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHRoaXMudmVyYm9zZSkgY29uc29sZS5sb2coJ0VvcyBub2RlIGtpbGxlZC4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJlc3RhcnQoKSB7XG4gICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgICBhd2FpdCB0aGlzLnJ1bigpO1xuICAgIH1cblxuXG4gICAgYXN5bmMgaW5pdCgpIHtcblxuICAgICAgICBpZiAoIXRoaXMucnVubmluZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFb3Mgbm9kZSBtdXN0IHJ1bm5pbmcgcmVjZWl2ZXIgc2V0dXAgaW5pdGlhbCBzdGF0ZS4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVvcyA9IGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuICAgICAgICBhd2FpdCB0aGlzLnJlZ2lzdGVyQWNjb3VudHMoZW9zKTtcbiAgICAgICAgYXdhaXQgdGhpcy5kZXBsb3koZW9zKTtcbiAgICAgICAgYXdhaXQgdGhpcy5pc3N1ZVRva2Vucyhlb3MpO1xuICAgICAgICBhd2FpdCB0aGlzLmdyYW50UGVybWlzc2lvbnMoZW9zKTtcbiAgICB9XG5cblxuICAgIGFzeW5jIHJlZ2lzdGVyQWNjb3VudHMoZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy5wcm92aWRlci5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuemFwLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy50b2tlbi5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMudXNlci5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgYXN5bmMgaXNzdWVUb2tlbnMoZW9zOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IG5ldyBUcmFuc2FjdGlvbigpXG4gICAgICAgICAgICAuc2VuZGVyKHRoaXMudG9rZW4pXG4gICAgICAgICAgICAucmVjZWl2ZXIodGhpcy50b2tlbilcbiAgICAgICAgICAgIC5hY3Rpb24oJ2lzc3VlJylcbiAgICAgICAgICAgIC5kYXRhKHt0bzogdGhpcy51c2VyLm5hbWUsIHF1YW50aXR5OiAnMTAwMDAwMCBUU1QnLCBtZW1vOiAnJ30pXG4gICAgICAgICAgICAuZXhlY3V0ZShlb3MpO1xuICAgIH1cblxuICAgIGFzeW5jIGRlcGxveShlb3M6IGFueSkge1xuICAgICAgICBjb25zdCByZXN1bHRzOiBhbnkgPSBbXTtcbiAgICAgICAgY29uc3QgZGVwbG95ZXIgPSBuZXcgRGVwbG95ZXIoe2VvczogZW9zLCBjb250cmFjdF9uYW1lOiAnbWFpbid9KTtcbiAgICAgICAgZGVwbG95ZXIuZnJvbSh0aGlzLnphcCk7XG4gICAgICAgIGRlcGxveWVyLmFiaShCaW5hcmllcy5tYWluQWJpKTtcbiAgICAgICAgZGVwbG95ZXIud2FzbShCaW5hcmllcy5tYWluV2FzbSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCBkZXBsb3llci5kZXBsb3koKSk7XG5cbiAgICAgICAgbGV0IGNyZWF0ZVRva2VuVHJhbnNhY3Rpb24gPSBuZXcgVHJhbnNhY3Rpb24oKVxuICAgICAgICAgICAgLnNlbmRlcih0aGlzLnRva2VuKVxuICAgICAgICAgICAgLnJlY2VpdmVyKHRoaXMudG9rZW4pXG4gICAgICAgICAgICAuYWN0aW9uKCdjcmVhdGUnKVxuICAgICAgICAgICAgLmRhdGEoe2lzc3VlcjogdGhpcy50b2tlbi5uYW1lLCBtYXhpbXVtX3N1cHBseTogJzEwMDAwMDAwMDAgVFNUJ30pO1xuXG4gICAgICAgIHJlc3VsdHMucHVzaChcbiAgICAgICAgICAgIGF3YWl0IG5ldyBEZXBsb3llcih7ZW9zOiBlb3MsIGNvbnRyYWN0X25hbWU6ICdlb3Npby50b2tlbid9KVxuICAgICAgICAgICAgICAgIC5mcm9tKHRoaXMudG9rZW4pXG4gICAgICAgICAgICAgICAgLmFiaShCaW5hcmllcy50b2tlbkFiaSlcbiAgICAgICAgICAgICAgICAud2FzbShCaW5hcmllcy50b2tlbldhc20pXG4gICAgICAgICAgICAgICAgLmFmdGVyRGVwbG95KGNyZWF0ZVRva2VuVHJhbnNhY3Rpb24pXG4gICAgICAgICAgICAgICAgLmRlcGxveSgpXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgYXN5bmMgZ3JhbnRQZXJtaXNzaW9ucyhlb3M6IGFueSkge1xuICAgICAgICBsZXQgbmV3UGVybWlzc2lvbiA9IHtcbiAgICAgICAgICAgIHBlcm1pc3Npb246IHtcbiAgICAgICAgICAgICAgICBhY3RvcjogdGhpcy56YXAubmFtZSxcbiAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnZW9zaW8uY29kZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3ZWlnaHQ6IDFcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgdXNlciA9IGF3YWl0IGVvcy5nZXRBY2NvdW50KHRoaXMudXNlci5uYW1lKTtcbiAgICAgICAgbGV0IG1haW4gPSBhd2FpdCBlb3MuZ2V0QWNjb3VudCh0aGlzLnphcC5uYW1lKTtcblxuICAgICAgICBsZXQgbmV3VXNlckF1dGggPSB1c2VyLnBlcm1pc3Npb25zW2ZpbmRFbGVtZW50KHVzZXIucGVybWlzc2lvbnMsICdwZXJtX25hbWUnLCAnYWN0aXZlJyldO1xuICAgICAgICBuZXdVc2VyQXV0aC5yZXF1aXJlZF9hdXRoLmFjY291bnRzLnB1c2gobmV3UGVybWlzc2lvbik7XG5cbiAgICAgICAgbGV0IG5ld01haW5BdXRoID0gbWFpbi5wZXJtaXNzaW9uc1tmaW5kRWxlbWVudChtYWluLnBlcm1pc3Npb25zLCAncGVybV9uYW1lJywgJ2FjdGl2ZScpXTtcbiAgICAgICAgbmV3TWFpbkF1dGgucmVxdWlyZWRfYXV0aC5hY2NvdW50cy5wdXNoKG5ld1Blcm1pc3Npb24pO1xuXG4gICAgICAgIGF3YWl0IGVvcy50cmFuc2FjdGlvbigodHI6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHRyLnVwZGF0ZWF1dGgoe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiB1c2VyLmFjY291bnRfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbjogJ2FjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ293bmVyJyxcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogbmV3VXNlckF1dGgucmVxdWlyZWRfYXV0aFxuICAgICAgICAgICAgICAgIH0sIHthdXRob3JpemF0aW9uOiBgJHt1c2VyLmFjY291bnRfbmFtZX1Ab3duZXJgfSk7XG5cbiAgICAgICAgICAgICAgICB0ci51cGRhdGVhdXRoKHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogbWFpbi5hY2NvdW50X25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb246ICdhY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdvd25lcicsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IG5ld01haW5BdXRoLnJlcXVpcmVkX2F1dGhcbiAgICAgICAgICAgICAgICB9LCB7YXV0aG9yaXphdGlvbjogYCR7bWFpbi5hY2NvdW50X25hbWV9QG93bmVyYH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldFByb3ZpZGVyQWNjb3VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvdmlkZXI7XG4gICAgfVxuXG4gICAgZ2V0VXNlckFjY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVzZXI7XG4gICAgfVxufVxuIl19