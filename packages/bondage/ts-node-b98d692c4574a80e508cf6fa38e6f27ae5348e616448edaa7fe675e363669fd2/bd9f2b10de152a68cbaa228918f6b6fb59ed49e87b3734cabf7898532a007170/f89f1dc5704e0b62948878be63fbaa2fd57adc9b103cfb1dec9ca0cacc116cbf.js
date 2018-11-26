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
/*const NODEOS_PATH = '/home/kostya/blockchain/eos/build/programs/nodeos/nodeos';
const EOS_DIR = '/home/kostya/blockchain/eos';

const ACC_TEST_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const ACC_OWNER_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';*/
const NODEOS_PATH = '/usr/local/bin/nodeos';
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
            //  this.instance = spawn(this.nodeos_path, ['--contracts-console', '--delete-all-blocks', '--access-control-allow-origin=*']);
            this.instance = child_process_1.spawn(this.nodeos_path, ['-e -p eosio', '--delete-all-blocks', '--plugin eosio::producer_plugin', '--plugin eosio::history_plugin', '--plugin eosio::chain_api_plugin', '--plugin eosio::history_api_plugin', '--plugin eosio::http_plugin'], { shell: true, detached: true });
            // wait until node is running
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
            results.push(yield this.provider.register(eos));
            results.push(yield this.zap.register(eos));
            results.push(yield this.token.register(eos));
            results.push(yield this.user.register(eos));
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
    getTokenAccount() {
        return this.token;
    }
}
exports.TestNode = TestNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L2Vudmlyb25tZW50LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL2JvbmRhZ2Uvc3JjL3Rlc3QvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsZ0RBQTRHO0FBQzVHLGlEQUE4QztBQUU5QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUdsRCxzREFBK0M7QUFHL0MsMkJBQTJCO0FBQzNCOzs7O21GQUltRjtBQUNuRixNQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQztBQUM1QyxNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQztBQUVqQyxNQUFNLGlCQUFpQixHQUFHLHFEQUFxRCxDQUFDO0FBQ2hGLE1BQU0sa0JBQWtCLEdBQUcscURBQXFELENBQUM7QUFFakYsbUJBQW1CLEtBQXNCLEVBQUUsSUFBWTtJQUNuRCxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFDeEMsa0JBQWtCLElBQVM7WUFDdkIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxxQkFBcUIsS0FBaUIsRUFBRSxLQUFhLEVBQUUsS0FBVTtJQUM3RCxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRTtR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QUksQ0FBQyxZQUFZLFFBQVEsRUFBQyxDQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUNKLENBQUM7UUFDTixDQUFDO0tBQUE7SUFFRCxrQkFBa0I7UUFDZCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELGNBQWM7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUNELGVBQWU7UUFDWCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztDQUNKO0FBOUpELDRCQThKQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQge0FjY291bnQsIE5vZGUsIERlcGxveWVyLCBUcmFuc2FjdGlvbiwgU2ltcGxlRXZlbnRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyfSBmcm9tICdAemFwanMvZW9zLXV0aWxzJztcbmltcG9ydCB7c3Bhd24sIGV4ZWNTeW5jfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgUFJPSkVDVF9QQVRIID0gcGF0aC5qb2luKF9fZGlybmFtZSArICcvLi4nKTtcbmltcG9ydCAqIGFzIHN0cmVhbSBmcm9tIFwic3RyZWFtXCI7XG5cbmltcG9ydCB7IEJpbmFyaWVzIH0gZnJvbSBcIkB6YXBqcy9lb3MtYmluYXJpZXNcIjtcblxuXG4vL1RPRE86IHJlY2VpdmUgZHluYW1pY2FsbHlcbi8qY29uc3QgTk9ERU9TX1BBVEggPSAnL2hvbWUva29zdHlhL2Jsb2NrY2hhaW4vZW9zL2J1aWxkL3Byb2dyYW1zL25vZGVvcy9ub2Rlb3MnO1xuY29uc3QgRU9TX0RJUiA9ICcvaG9tZS9rb3N0eWEvYmxvY2tjaGFpbi9lb3MnO1xuXG5jb25zdCBBQ0NfVEVTVF9QUklWX0tFWSA9ICc1S1F3clBid2RMNlBoWHVqeFczN0ZTU1FaMUppd3NTVDRjcVF6RGV5WHRQNzl6a3ZGRDMnO1xuY29uc3QgQUNDX09XTkVSX1BSSVZfS0VZID0gJzVLUXdyUGJ3ZEw2UGhYdWp4VzM3RlNTUVoxSml3c1NUNGNxUXpEZXlYdFA3OXprdkZEMyc7Ki9cbmNvbnN0IE5PREVPU19QQVRIID0gJy91c3IvbG9jYWwvYmluL25vZGVvcyc7XG5jb25zdCBFT1NfRElSID0gJy9ob21lL3VzZXIvZW9zJztcblxuY29uc3QgQUNDX1RFU1RfUFJJVl9LRVkgPSAnNUtRd3JQYndkTDZQaFh1anhXMzdGU1NRWjFKaXdzU1Q0Y3FRekRleVh0UDc5emt2RkQzJztcbmNvbnN0IEFDQ19PV05FUl9QUklWX0tFWSA9ICc1S1F3clBid2RMNlBoWHVqeFczN0ZTU1FaMUppd3NTVDRjcVF6RGV5WHRQNzl6a3ZGRDMnO1xuXG5mdW5jdGlvbiB3YWl0RXZlbnQoZXZlbnQ6IHN0cmVhbS5SZWFkYWJsZSwgdHlwZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gbGlzdGVuZXIoZGF0YTogYW55KSB7XG4gICAgICAgICAgICBldmVudC5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnQub24odHlwZSwgbGlzdGVuZXIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBmaW5kRWxlbWVudChhcnJheTogQXJyYXk8YW55PiwgZmllbGQ6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIGZvciAobGV0IGkgaW4gYXJyYXkpIHtcbiAgICAgICAgaWYgKGFycmF5Lmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV1bZmllbGRdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xufVxuXG5leHBvcnQgY2xhc3MgVGVzdE5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICByZWNvbXBpbGU6IGJvb2xlYW47XG4gICAgcnVubmluZzogYm9vbGVhbjtcbiAgICBwcm92aWRlcjogQWNjb3VudDtcbiAgICB6YXA6IEFjY291bnQ7XG4gICAgbm9kZW9zX3BhdGg6IHN0cmluZztcbiAgICBpbnN0YW5jZTogYW55O1xuICAgIHVzZXI6IEFjY291bnQ7XG4gICAgdG9rZW46IEFjY291bnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcih2ZXJib3NlOiBib29sZWFuLCByZWNvbXBpbGU6IGJvb2xlYW4sIGVuZHBvaW50OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgdmVyYm9zZTogdmVyYm9zZSxcbiAgICAgICAgICAgIGtleV9wcm92aWRlcjogW0FDQ19URVNUX1BSSVZfS0VZLCBBQ0NfT1dORVJfUFJJVl9LRVldLFxuICAgICAgICAgICAgaHR0cF9lbmRwb2ludDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODg4OCcsXG4gICAgICAgICAgICBjaGFpbl9pZDogJydcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVjb21waWxlID0gcmVjb21waWxlO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XG4gICAgICAgIHRoaXMubm9kZW9zX3BhdGggPSBOT0RFT1NfUEFUSDtcbiAgICAgICAgdGhpcy5wcm92aWRlciA9IG5ldyBBY2NvdW50KCd6YXAucHJvdmlkZXInKS51c2VQcml2YXRlS2V5KEFDQ19PV05FUl9QUklWX0tFWSk7XG4gICAgICAgIHRoaXMuemFwID0gdGhpcy5nZXRaYXBBY2NvdW50KCkudXNlUHJpdmF0ZUtleShBQ0NfT1dORVJfUFJJVl9LRVkpO1xuICAgICAgICB0aGlzLnVzZXIgPSBuZXcgQWNjb3VudCgndXNlcicpLnVzZVByaXZhdGVLZXkoQUNDX1RFU1RfUFJJVl9LRVkpO1xuICAgICAgICB0aGlzLnRva2VuID0gbmV3IEFjY291bnQoJ3phcC50b2tlbicpLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICB9XG5cbiAgICBhc3luYyBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rlc3QgRU9TIG5vZGUgaXMgYWxyZWFkeSBydW5uaW5nLicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHVzZSBzcGF3biBmdW5jdGlvbiBiZWNhdXNlIG5vZGVvcyBoYXMgaW5maW5pdHkgb3V0cHV0XG5cbiAgICAgIC8vICB0aGlzLmluc3RhbmNlID0gc3Bhd24odGhpcy5ub2Rlb3NfcGF0aCwgWyctLWNvbnRyYWN0cy1jb25zb2xlJywgJy0tZGVsZXRlLWFsbC1ibG9ja3MnLCAnLS1hY2Nlc3MtY29udHJvbC1hbGxvdy1vcmlnaW49KiddKTtcbiAgICAgICAgdGhpcy5pbnN0YW5jZSA9IHNwYXduKHRoaXMubm9kZW9zX3BhdGgsIFsnLWUgLXAgZW9zaW8nLCAnLS1kZWxldGUtYWxsLWJsb2NrcycsICctLXBsdWdpbiBlb3Npbzo6cHJvZHVjZXJfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpoaXN0b3J5X3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6Y2hhaW5fYXBpX3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6aGlzdG9yeV9hcGlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpodHRwX3BsdWdpbiddLCB7c2hlbGw6IHRydWUsIGRldGFjaGVkOiB0cnVlfSk7XG4gICAgICAvLyB3YWl0IHVudGlsIG5vZGUgaXMgcnVubmluZ1xuICAgICAgICAvLyB3YWl0IHVudGlsIG5vZGUgaXMgcnVubmluZ1xuXG4gICAgICAgIHdoaWxlICh0aGlzLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBhd2FpdCB3YWl0RXZlbnQodGhpcy5pbnN0YW5jZS5zdGRlcnIsICdkYXRhJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy52ZXJib3NlKSBjb25zb2xlLmxvZygnRW9zIG5vZGUgaXMgcnVubmluZy4nKVxuICAgIH1cblxuICAgIGtpbGwoKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLmtpbGwoKTtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy52ZXJib3NlKSBjb25zb2xlLmxvZygnRW9zIG5vZGUga2lsbGVkLicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcmVzdGFydCgpIHtcbiAgICAgICAgdGhpcy5raWxsKCk7XG4gICAgICAgIGF3YWl0IHRoaXMucnVuKCk7XG4gICAgfVxuXG5cbiAgICBhc3luYyBpbml0KCkge1xuXG4gICAgICAgIGlmICghdGhpcy5ydW5uaW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VvcyBub2RlIG11c3QgcnVubmluZyByZWNlaXZlciBzZXR1cCBpbml0aWFsIHN0YXRlLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW9zID0gYXdhaXQgdGhpcy5jb25uZWN0KCk7XG4gICAgICAgIGF3YWl0IHRoaXMucmVnaXN0ZXJBY2NvdW50cyhlb3MpO1xuICAgICAgICBhd2FpdCB0aGlzLmRlcGxveShlb3MpO1xuICAgICAgICBhd2FpdCB0aGlzLmdyYW50UGVybWlzc2lvbnMoZW9zKTtcbiAgICB9XG5cblxuICAgIGFzeW5jIHJlZ2lzdGVyQWNjb3VudHMoZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy5wcm92aWRlci5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuemFwLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy50b2tlbi5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMudXNlci5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG5cbiAgICBhc3luYyBkZXBsb3koZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGRlcGxveWVyID0gbmV3IERlcGxveWVyKHtlb3M6IGVvcywgY29udHJhY3RfbmFtZTogJ21haW4nfSk7XG4gICAgICAgIGRlcGxveWVyLmZyb20odGhpcy56YXApO1xuICAgICAgICBkZXBsb3llci5hYmkoQmluYXJpZXMubWFpbkFiaSk7XG4gICAgICAgIGRlcGxveWVyLndhc20oQmluYXJpZXMubWFpbldhc20pO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgZGVwbG95ZXIuZGVwbG95KCkpO1xuXG4gICAgICAgIGxldCBjcmVhdGVUb2tlblRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKClcbiAgICAgICAgICAgIC5zZW5kZXIodGhpcy50b2tlbilcbiAgICAgICAgICAgIC5yZWNlaXZlcih0aGlzLnRva2VuKVxuICAgICAgICAgICAgLmFjdGlvbignY3JlYXRlJylcbiAgICAgICAgICAgIC5kYXRhKHtpc3N1ZXI6IHRoaXMudG9rZW4ubmFtZSwgbWF4aW11bV9zdXBwbHk6ICcxMDAwMDAwMDAwIFRTVCd9KTtcblxuICAgICAgICByZXN1bHRzLnB1c2goXG4gICAgICAgICAgICBhd2FpdCBuZXcgRGVwbG95ZXIoe2VvczogZW9zLCBjb250cmFjdF9uYW1lOiAnZW9zaW8udG9rZW4nfSlcbiAgICAgICAgICAgICAgICAuZnJvbSh0aGlzLnRva2VuKVxuICAgICAgICAgICAgICAgIC5hYmkoQmluYXJpZXMudG9rZW5BYmkpXG4gICAgICAgICAgICAgICAgLndhc20oQmluYXJpZXMudG9rZW5XYXNtKVxuICAgICAgICAgICAgICAgIC5hZnRlckRlcGxveShjcmVhdGVUb2tlblRyYW5zYWN0aW9uKVxuICAgICAgICAgICAgICAgIC5kZXBsb3koKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFzeW5jIGdyYW50UGVybWlzc2lvbnMoZW9zOiBhbnkpIHtcbiAgICAgICAgbGV0IG5ld1Blcm1pc3Npb24gPSB7XG4gICAgICAgICAgICBwZXJtaXNzaW9uOiB7XG4gICAgICAgICAgICAgICAgYWN0b3I6IHRoaXMuemFwLm5hbWUsXG4gICAgICAgICAgICAgICAgcGVybWlzc2lvbjogJ2Vvc2lvLmNvZGUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2VpZ2h0OiAxXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHVzZXIgPSBhd2FpdCBlb3MuZ2V0QWNjb3VudCh0aGlzLnVzZXIubmFtZSk7XG4gICAgICAgIGxldCBtYWluID0gYXdhaXQgZW9zLmdldEFjY291bnQodGhpcy56YXAubmFtZSk7XG5cbiAgICAgICAgbGV0IG5ld1VzZXJBdXRoID0gdXNlci5wZXJtaXNzaW9uc1tmaW5kRWxlbWVudCh1c2VyLnBlcm1pc3Npb25zLCAncGVybV9uYW1lJywgJ2FjdGl2ZScpXTtcbiAgICAgICAgbmV3VXNlckF1dGgucmVxdWlyZWRfYXV0aC5hY2NvdW50cy5wdXNoKG5ld1Blcm1pc3Npb24pO1xuXG4gICAgICAgIGxldCBuZXdNYWluQXV0aCA9IG1haW4ucGVybWlzc2lvbnNbZmluZEVsZW1lbnQobWFpbi5wZXJtaXNzaW9ucywgJ3Blcm1fbmFtZScsICdhY3RpdmUnKV07XG4gICAgICAgIG5ld01haW5BdXRoLnJlcXVpcmVkX2F1dGguYWNjb3VudHMucHVzaChuZXdQZXJtaXNzaW9uKTtcblxuICAgICAgICBhd2FpdCBlb3MudHJhbnNhY3Rpb24oKHRyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB0ci51cGRhdGVhdXRoKHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogdXNlci5hY2NvdW50X25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb246ICdhY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdvd25lcicsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IG5ld1VzZXJBdXRoLnJlcXVpcmVkX2F1dGhcbiAgICAgICAgICAgICAgICB9LCB7YXV0aG9yaXphdGlvbjogYCR7dXNlci5hY2NvdW50X25hbWV9QG93bmVyYH0pO1xuXG4gICAgICAgICAgICAgICAgdHIudXBkYXRlYXV0aCh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG1haW4uYWNjb3VudF9uYW1lLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiAnb3duZXInLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiBuZXdNYWluQXV0aC5yZXF1aXJlZF9hdXRoXG4gICAgICAgICAgICAgICAgfSwge2F1dGhvcml6YXRpb246IGAke21haW4uYWNjb3VudF9uYW1lfUBvd25lcmB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXRQcm92aWRlckFjY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3ZpZGVyO1xuICAgIH1cblxuICAgIGdldFVzZXJBY2NvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy51c2VyO1xuICAgIH1cbiAgICBnZXRUb2tlbkFjY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRva2VuO1xuICAgIH1cbn1cbiJdfQ==