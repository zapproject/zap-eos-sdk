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
const eos_binaries_1 = require("@zapjs/eos-binaries");
const PROJECT_PATH = path.join(__dirname + '/..');
//TODO: receive dynamically
const NODEOS_PATH = '/home/user/eos/build/programs/nodeos/nodeos';
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
        this.zap = this.getZapAccount();
        this.account_user = new eos_utils_1.Account('user');
        this.account_main = new eos_utils_1.Account('main');
        this.account_receiver = new eos_utils_1.Account('receiver');
        this.zap.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.account_user.usePrivateKey(ACC_TEST_PRIV_KEY);
        this.account_main.usePrivateKey(ACC_OWNER_PRIV_KEY);
        this.account_receiver.usePrivateKey(ACC_TEST_PRIV_KEY);
    }
    getAccounts() {
        return {
            account_user: this.account_user,
            account_receiver: this.account_receiver,
            account_main: this.account_main,
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
            yield this.grantPermissions(eos);
        });
    }
    registerAccounts(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            results.push(yield this.zap.register(eos));
            results.push(yield this.account_user.register(eos));
            results.push(yield this.account_main.register(eos));
            results.push(yield this.account_receiver.register(eos));
            return results;
        });
    }
    deploy(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const deployer = new eos_utils_1.Deployer({ eos: eos, contract_name: 'eosio.token' });
            let createTokenTransaction = new eos_utils_1.Transaction()
                .sender(this.zap)
                .receiver(this.zap)
                .action('create')
                .data({ issuer: this.zap.name, maximum_supply: '1000000000 TST' });
            deployer.from(this.zap);
            deployer.abi(eos_binaries_1.Binaries.tokenAbi);
            deployer.wasm(eos_binaries_1.Binaries.tokenWasm);
            deployer.afterDeploy(createTokenTransaction);
            results.push(yield deployer.deploy());
            return results;
        });
    }
    grantPermissions(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            let newPermission = {
                permission: {
                    actor: this.account_main.name,
                    permission: 'eosio.code'
                },
                weight: 1
            };
            let user = yield eos.getAccount(this.account_user.name);
            let main = yield eos.getAccount(this.account_main.name);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9taW50aW5nL3NyYy90ZXN0L2Vudmlyb25tZW50LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL21pbnRpbmcvc3JjL3Rlc3QvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsZ0RBQTRHO0FBQzVHLGlEQUE4QztBQUM5QyxzREFBK0M7QUFFL0MsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFLbEQsMkJBQTJCO0FBQzNCLE1BQU0sV0FBVyxHQUFHLDZDQUE2QyxDQUFDO0FBQ2xFLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQ2pDLE1BQU0sU0FBUyxHQUFHLE9BQU8sR0FBRyw4QkFBOEIsQ0FBQztBQUMzRCxNQUFNLGlCQUFpQixHQUFHLHFEQUFxRCxDQUFDO0FBQ2hGLE1BQU0sa0JBQWtCLEdBQUcscURBQXFELENBQUM7QUFHakYsbUJBQW1CLEtBQXNCLEVBQUUsSUFBWTtJQUNuRCxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFDeEMsa0JBQWtCLElBQVM7WUFDdkIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxxQkFBcUIsS0FBaUIsRUFBRSxLQUFhLEVBQUUsS0FBYTtJQUNoRSxLQUFL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YTtpQkFDbEMsRUFBRSxFQUFDLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLFFBQVEsRUFBQyxDQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUNKLENBQUM7UUFDTixDQUFDO0tBQUE7Q0FFSjtBQXJKRCw0QkFxSkMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHtBY2NvdW50LCBOb2RlLCBEZXBsb3llciwgVHJhbnNhY3Rpb24sIFNpbXBsZUV2ZW50TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcn0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQge3NwYXduLCBleGVjU3luY30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBCaW5hcmllcyB9IGZyb20gXCJAemFwanMvZW9zLWJpbmFyaWVzXCI7XG5cbmNvbnN0IFBST0pFQ1RfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUgKyAnLy4uJyk7XG5cbmltcG9ydCAqIGFzIHN0cmVhbSBmcm9tIFwic3RyZWFtXCI7XG5cblxuLy9UT0RPOiByZWNlaXZlIGR5bmFtaWNhbGx5XG5jb25zdCBOT0RFT1NfUEFUSCA9ICcvaG9tZS91c2VyL2Vvcy9idWlsZC9wcm9ncmFtcy9ub2Rlb3Mvbm9kZW9zJztcbmNvbnN0IEVPU19ESVIgPSAnL2hvbWUvdXNlci9lb3MnO1xuY29uc3QgVE9LRU5fRElSID0gRU9TX0RJUiArICcvYnVpbGQvY29udHJhY3RzL2Vvc2lvLnRva2VuJztcbmNvbnN0IEFDQ19URVNUX1BSSVZfS0VZID0gJzVLZkZ1Zm5VVGhhRWVxc1NlTVB0MjdQb2FuNWc4TFVhRW9yc0MxaEhtMUZnTkpmcjNzWCc7XG5jb25zdCBBQ0NfT1dORVJfUFJJVl9LRVkgPSAnNUtRd3JQYndkTDZQaFh1anhXMzdGU1NRWjFKaXdzU1Q0Y3FRekRleVh0UDc5emt2RkQzJztcblxuXG5mdW5jdGlvbiB3YWl0RXZlbnQoZXZlbnQ6IHN0cmVhbS5SZWFkYWJsZSwgdHlwZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gbGlzdGVuZXIoZGF0YTogYW55KSB7XG4gICAgICAgICAgICBldmVudC5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnQub24odHlwZSwgbGlzdGVuZXIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBmaW5kRWxlbWVudChhcnJheTogQXJyYXk8YW55PiwgZmllbGQ6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIGZvciAobGV0IGkgaW4gYXJyYXkpIHtcbiAgICAgICAgaWYgKGFycmF5Lmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV1bZmllbGRdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xufVxuXG5leHBvcnQgY2xhc3MgVGVzdE5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICByZWNvbXBpbGU6IGJvb2xlYW47XG4gICAgcnVubmluZzogYm9vbGVhbjtcbiAgICB6YXA6IEFjY291bnQ7XG4gICAgbm9kZW9zX3BhdGg6IHN0cmluZztcbiAgICBpbnN0YW5jZTogYW55O1xuICAgIGFjY291bnRfdXNlcjogQWNjb3VudDtcbiAgICBhY2NvdW50X21haW46IEFjY291bnQ7XG4gICAgYWNjb3VudF9yZWNlaXZlcjogQWNjb3VudDtcblxuICAgIGNvbnN0cnVjdG9yKHZlcmJvc2U6IGJvb2xlYW4sIHJlY29tcGlsZTogYm9vbGVhbiwgZW5kcG9pbnQ6IHN0cmluZykge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICB2ZXJib3NlOiB2ZXJib3NlLFxuICAgICAgICAgICAga2V5X3Byb3ZpZGVyOiBbQUNDX1RFU1RfUFJJVl9LRVksIEFDQ19PV05FUl9QUklWX0tFWV0sXG4gICAgICAgICAgICBodHRwX2VuZHBvaW50OiAnaHR0cDovLzEyNy4wLjAuMTo4ODg4JyxcbiAgICAgICAgICAgIGNoYWluX2lkOiAnJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWNvbXBpbGUgPSByZWNvbXBpbGU7XG4gICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5ub2Rlb3NfcGF0aCA9IE5PREVPU19QQVRIO1xuICAgICAgICB0aGlzLnphcCA9IHRoaXMuZ2V0WmFwQWNjb3VudCgpO1xuICAgICAgICB0aGlzLmFjY291bnRfdXNlciA9IG5ldyBBY2NvdW50KCd1c2VyJyk7XG4gICAgICAgIHRoaXMuYWNjb3VudF9tYWluID0gbmV3IEFjY291bnQoJ21haW4nKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3JlY2VpdmVyID0gbmV3IEFjY291bnQoJ3JlY2VpdmVyJyk7XG4gICAgICAgIHRoaXMuemFwLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3VzZXIudXNlUHJpdmF0ZUtleShBQ0NfVEVTVF9QUklWX0tFWSk7XG4gICAgICAgIHRoaXMuYWNjb3VudF9tYWluLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3JlY2VpdmVyLnVzZVByaXZhdGVLZXkoQUNDX1RFU1RfUFJJVl9LRVkpO1xuXG4gICAgfVxuXG4gICAgZ2V0QWNjb3VudHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY2NvdW50X3VzZXI6IHRoaXMuYWNjb3VudF91c2VyLFxuICAgICAgICAgICAgYWNjb3VudF9yZWNlaXZlcjogdGhpcy5hY2NvdW50X3JlY2VpdmVyLFxuICAgICAgICAgICAgYWNjb3VudF9tYWluOiB0aGlzLmFjY291bnRfbWFpbixcbiAgICAgICAgICAgIHphcDogdGhpcy56YXBcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYyBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rlc3QgRU9TIG5vZGUgaXMgYWxyZWFkeSBydW5uaW5nLicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHVzZSBzcGF3biBmdW5jdGlvbiBiZWNhdXNlIG5vZGVvcyBoYXMgaW5maW5pdHkgb3V0cHV0XG4gICAgICAgIHRoaXMuaW5zdGFuY2UgPSBzcGF3bih0aGlzLm5vZGVvc19wYXRoLCBbJy1lIC1wIGVvc2lvJywgJy0tZGVsZXRlLWFsbC1ibG9ja3MnLCAnLS1wbHVnaW4gZW9zaW86OnByb2R1Y2VyX3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6aGlzdG9yeV9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86OmNoYWluX2FwaV9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omhpc3RvcnlfYXBpX3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6aHR0cF9wbHVnaW4nXSwge3NoZWxsOiB0cnVlfSk7XG4gICAgICAgIC8vIHdhaXQgdW50aWwgbm9kZSBpcyBydW5uaW5nXG5cbiAgICAgICAgd2hpbGUgKHRoaXMucnVubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGF3YWl0IHdhaXRFdmVudCh0aGlzLmluc3RhbmNlLnN0ZGVyciwgJ2RhdGEnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnZlcmJvc2UpIGNvbnNvbGUubG9nKCdFb3Mgbm9kZSBpcyBydW5uaW5nLicpXG4gICAgfVxuXG4gICAga2lsbCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2Uua2lsbCgpO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLnZlcmJvc2UpIGNvbnNvbGUubG9nKCdFb3Mgbm9kZSBraWxsZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyByZXN0YXJ0KCkge1xuICAgICAgICB0aGlzLmtpbGwoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5ydW4oKTtcbiAgICB9XG5cblxuICAgIGFzeW5jIGluaXQoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW9zIG5vZGUgbXVzdCBydW5uaW5nIHJlY2VpdmVyIHNldHVwIGluaXRpYWwgc3RhdGUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWdpc3RlckFjY291bnRzKGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuZGVwbG95KGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuZ3JhbnRQZXJtaXNzaW9ucyhlb3MpO1xuICAgIH1cblxuXG4gICAgYXN5bmMgcmVnaXN0ZXJBY2NvdW50cyhlb3M6IGFueSkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCB0aGlzLnphcC5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuYWNjb3VudF91c2VyLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy5hY2NvdW50X21haW4ucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCB0aGlzLmFjY291bnRfcmVjZWl2ZXIucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFzeW5jIGRlcGxveShlb3M6IGFueSkge1xuICAgICAgICBjb25zdCByZXN1bHRzOiBhbnkgPSBbXTtcbiAgICAgICAgY29uc3QgZGVwbG95ZXIgPSBuZXcgRGVwbG95ZXIoe2VvczogZW9zLCBjb250cmFjdF9uYW1lOiAnZW9zaW8udG9rZW4nfSk7XG4gICAgICAgIGxldCBjcmVhdGVUb2tlblRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKClcbiAgICAgICAgICAgIC5zZW5kZXIodGhpcy56YXApXG4gICAgICAgICAgICAucmVjZWl2ZXIodGhpcy56YXApXG4gICAgICAgICAgICAuYWN0aW9uKCdjcmVhdGUnKVxuICAgICAgICAgICAgLmRhdGEoe2lzc3VlcjogdGhpcy56YXAubmFtZSwgbWF4aW11bV9zdXBwbHk6ICcxMDAwMDAwMDAwIFRTVCd9KTtcbiAgICAgICAgZGVwbG95ZXIuZnJvbSh0aGlzLnphcCk7XG4gICAgICAgIGRlcGxveWVyLmFiaShCaW5hcmllcy50b2tlbkFiaSk7XG4gICAgICAgIGRlcGxveWVyLndhc20oQmluYXJpZXMudG9rZW5XYXNtKTtcbiAgICAgICAgZGVwbG95ZXIuYWZ0ZXJEZXBsb3koY3JlYXRlVG9rZW5UcmFuc2FjdGlvbik7XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCBkZXBsb3llci5kZXBsb3koKSk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFzeW5jIGdyYW50UGVybWlzc2lvbnMoZW9zOiBhbnkpIHtcbiAgICAgICAgbGV0IG5ld1Blcm1pc3Npb24gPSB7XG4gICAgICAgICAgICBwZXJtaXNzaW9uOiB7XG4gICAgICAgICAgICAgICAgYWN0b3I6IHRoaXMuYWNjb3VudF9tYWluLm5hbWUsXG4gICAgICAgICAgICAgICAgcGVybWlzc2lvbjogJ2Vvc2lvLmNvZGUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2VpZ2h0OiAxXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHVzZXIgPSBhd2FpdCBlb3MuZ2V0QWNjb3VudCh0aGlzLmFjY291bnRfdXNlci5uYW1lKTtcbiAgICAgICAgbGV0IG1haW4gPSBhd2FpdCBlb3MuZ2V0QWNjb3VudCh0aGlzLmFjY291bnRfbWFpbi5uYW1lKTtcblxuICAgICAgICBsZXQgbmV3VXNlckF1dGggPSB1c2VyLnBlcm1pc3Npb25zW2ZpbmRFbGVtZW50KHVzZXIucGVybWlzc2lvbnMsICdwZXJtX25hbWUnLCAnYWN0aXZlJyldO1xuICAgICAgICBuZXdVc2VyQXV0aC5yZXF1aXJlZF9hdXRoLmFjY291bnRzLnB1c2gobmV3UGVybWlzc2lvbik7XG5cbiAgICAgICAgbGV0IG5ld01haW5BdXRoID0gbWFpbi5wZXJtaXNzaW9uc1tmaW5kRWxlbWVudChtYWluLnBlcm1pc3Npb25zLCAncGVybV9uYW1lJywgJ2FjdGl2ZScpXTtcbiAgICAgICAgbmV3TWFpbkF1dGgucmVxdWlyZWRfYXV0aC5hY2NvdW50cy5wdXNoKG5ld1Blcm1pc3Npb24pO1xuXG5cbiAgICAgICAgYXdhaXQgZW9zLnRyYW5zYWN0aW9uKCh0cjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgdHIudXBkYXRlYXV0aCh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IHVzZXIuYWNjb3VudF9uYW1lLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiAnb3duZXInLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiBuZXdVc2VyQXV0aC5yZXF1aXJlZF9hdXRoXG4gICAgICAgICAgICAgICAgfSwge2F1dGhvcml6YXRpb246IGAke3VzZXIuYWNjb3VudF9uYW1lfUBvd25lcmB9KTtcblxuICAgICAgICAgICAgICAgIHRyLnVwZGF0ZWF1dGgoe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiBtYWluLmFjY291bnRfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbjogJ2FjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ293bmVyJyxcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogbmV3TWFpbkF1dGgucmVxdWlyZWRfYXV0aFxuICAgICAgICAgICAgICAgIH0sIHthdXRob3JpemF0aW9uOiBgJHttYWluLmFjY291bnRfbmFtZX1Ab3duZXJgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG59XG4iXX0=