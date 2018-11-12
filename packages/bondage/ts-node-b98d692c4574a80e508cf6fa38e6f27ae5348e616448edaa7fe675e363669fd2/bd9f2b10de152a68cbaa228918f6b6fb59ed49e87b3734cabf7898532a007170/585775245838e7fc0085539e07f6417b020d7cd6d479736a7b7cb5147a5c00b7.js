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
    getTokenAccount() {
        return this.token;
    }
}
exports.TestNode = TestNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L2Vudmlyb25tZW50LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL2JvbmRhZ2Uvc3JjL3Rlc3QvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsZ0RBQTRHO0FBQzVHLGlEQUE4QztBQUU5QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUdsRCxzREFBK0M7QUFHL0MsMkJBQTJCO0FBQzNCLE1BQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDO0FBQzVDLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQ2pDLE1BQU0saUJBQWlCLEdBQUcscURBQXFELENBQUM7QUFDaEYsTUFBTSxrQkFBa0IsR0FBRyxxREFBcUQsQ0FBQztBQUdqRixtQkFBbUIsS0FBc0IsRUFBRSxJQUFZO0lBQ25ELE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtRQUN4QyxrQkFBa0IsSUFBUztZQUN2QixLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQztRQUVELEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELHFCQUFxQixLQUFpQixFQUFFLEtBQWEsRUFBRSxLQUFVO0lBQzdELEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFO1FBQ2pCLElBQUksS0FBSyxD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VyxDQUFDLGFBQWE7aUJBQ2xDLEVBQUUsRUFBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxRQUFRLEVBQUMsQ0FBQyxDQUFDO2dCQUVsRCxFQUFFLENBQUMsVUFBVSxDQUFDO29CQUNWLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDMUIsVUFBVSxFQUFFLFFBQVE7b0JBQ3BCLE1BQU0sRUFBRSxPQUFPO29CQUNmLElBQUksRUFBRSxXQUFXLENBQUMsYUFBYTtpQkFDbEMsRUFBRSxFQUFDLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLFFBQVEsRUFBQyxDQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUNKLENBQUM7UUFDTixDQUFDO0tBQUE7SUFFRCxrQkFBa0I7UUFDZCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELGNBQWM7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUNELGVBQWU7UUFDWCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztDQUNKO0FBbktELDRCQW1LQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQge0FjY291bnQsIE5vZGUsIERlcGxveWVyLCBUcmFuc2FjdGlvbiwgU2ltcGxlRXZlbnRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyfSBmcm9tICdAemFwanMvZW9zLXV0aWxzJztcbmltcG9ydCB7c3Bhd24sIGV4ZWNTeW5jfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgUFJPSkVDVF9QQVRIID0gcGF0aC5qb2luKF9fZGlybmFtZSArICcvLi4nKTtcbmltcG9ydCAqIGFzIHN0cmVhbSBmcm9tIFwic3RyZWFtXCI7XG5cbmltcG9ydCB7IEJpbmFyaWVzIH0gZnJvbSBcIkB6YXBqcy9lb3MtYmluYXJpZXNcIjtcblxuXG4vL1RPRE86IHJlY2VpdmUgZHluYW1pY2FsbHlcbmNvbnN0IE5PREVPU19QQVRIID0gJy91c3IvbG9jYWwvYmluL25vZGVvcyc7XG5jb25zdCBFT1NfRElSID0gJy9ob21lL3VzZXIvZW9zJztcbmNvbnN0IEFDQ19URVNUX1BSSVZfS0VZID0gJzVLUXdyUGJ3ZEw2UGhYdWp4VzM3RlNTUVoxSml3c1NUNGNxUXpEZXlYdFA3OXprdkZEMyc7XG5jb25zdCBBQ0NfT1dORVJfUFJJVl9LRVkgPSAnNUtRd3JQYndkTDZQaFh1anhXMzdGU1NRWjFKaXdzU1Q0Y3FRekRleVh0UDc5emt2RkQzJztcblxuXG5mdW5jdGlvbiB3YWl0RXZlbnQoZXZlbnQ6IHN0cmVhbS5SZWFkYWJsZSwgdHlwZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gbGlzdGVuZXIoZGF0YTogYW55KSB7XG4gICAgICAgICAgICBldmVudC5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnQub24odHlwZSwgbGlzdGVuZXIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBmaW5kRWxlbWVudChhcnJheTogQXJyYXk8YW55PiwgZmllbGQ6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIGZvciAobGV0IGkgaW4gYXJyYXkpIHtcbiAgICAgICAgaWYgKGFycmF5Lmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV1bZmllbGRdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xufVxuXG5leHBvcnQgY2xhc3MgVGVzdE5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICByZWNvbXBpbGU6IGJvb2xlYW47XG4gICAgcnVubmluZzogYm9vbGVhbjtcbiAgICBwcm92aWRlcjogQWNjb3VudDtcbiAgICB6YXA6IEFjY291bnQ7XG4gICAgbm9kZW9zX3BhdGg6IHN0cmluZztcbiAgICBpbnN0YW5jZTogYW55O1xuICAgIHVzZXI6IEFjY291bnQ7XG4gICAgdG9rZW46IEFjY291bnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcih2ZXJib3NlOiBib29sZWFuLCByZWNvbXBpbGU6IGJvb2xlYW4sIGVuZHBvaW50OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgdmVyYm9zZTogdmVyYm9zZSxcbiAgICAgICAgICAgIGtleV9wcm92aWRlcjogW0FDQ19URVNUX1BSSVZfS0VZLCBBQ0NfT1dORVJfUFJJVl9LRVldLFxuICAgICAgICAgICAgaHR0cF9lbmRwb2ludDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODg4OCcsXG4gICAgICAgICAgICBjaGFpbl9pZDogJydcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVjb21waWxlID0gcmVjb21waWxlO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XG4gICAgICAgIHRoaXMubm9kZW9zX3BhdGggPSBOT0RFT1NfUEFUSDtcbiAgICAgICAgdGhpcy5wcm92aWRlciA9IG5ldyBBY2NvdW50KCd6YXAucHJvdmlkZXInKS51c2VQcml2YXRlS2V5KEFDQ19PV05FUl9QUklWX0tFWSk7XG4gICAgICAgIHRoaXMuemFwID0gdGhpcy5nZXRaYXBBY2NvdW50KCkudXNlUHJpdmF0ZUtleShBQ0NfT1dORVJfUFJJVl9LRVkpO1xuICAgICAgICB0aGlzLnVzZXIgPSBuZXcgQWNjb3VudCgndXNlcicpLnVzZVByaXZhdGVLZXkoQUNDX1RFU1RfUFJJVl9LRVkpO1xuICAgICAgICB0aGlzLnRva2VuID0gbmV3IEFjY291bnQoJ3phcC50b2tlbicpLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICB9XG5cbiAgICBhc3luYyBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rlc3QgRU9TIG5vZGUgaXMgYWxyZWFkeSBydW5uaW5nLicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHVzZSBzcGF3biBmdW5jdGlvbiBiZWNhdXNlIG5vZGVvcyBoYXMgaW5maW5pdHkgb3V0cHV0XG4gICAgICAgIHRoaXMuaW5zdGFuY2UgPSBzcGF3bih0aGlzLm5vZGVvc19wYXRoLCBbJy1lIC1wIGVvc2lvJywgJy0tZGVsZXRlLWFsbC1ibG9ja3MnLCAnLS1wbHVnaW4gZW9zaW86OnByb2R1Y2VyX3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6aGlzdG9yeV9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86OmNoYWluX2FwaV9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omhpc3RvcnlfYXBpX3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6aHR0cF9wbHVnaW4nXSwgeyBzaGVsbDogdHJ1ZSB9KTtcbiAgICAgICAgLy8gd2FpdCB1bnRpbCBub2RlIGlzIHJ1bm5pbmdcblxuICAgICAgICB3aGlsZSAodGhpcy5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYXdhaXQgd2FpdEV2ZW50KHRoaXMuaW5zdGFuY2Uuc3RkZXJyLCAnZGF0YScpO1xuICAgICAgICAgICAgaWYgKHRoaXMucnVubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudmVyYm9zZSkgY29uc29sZS5sb2coJ0VvcyBub2RlIGlzIHJ1bm5pbmcuJylcbiAgICB9XG5cbiAgICBraWxsKCkge1xuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5raWxsKCk7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHRoaXMudmVyYm9zZSkgY29uc29sZS5sb2coJ0VvcyBub2RlIGtpbGxlZC4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJlc3RhcnQoKSB7XG4gICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgICBhd2FpdCB0aGlzLnJ1bigpO1xuICAgIH1cblxuXG4gICAgYXN5bmMgaW5pdCgpIHtcblxuICAgICAgICBpZiAoIXRoaXMucnVubmluZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFb3Mgbm9kZSBtdXN0IHJ1bm5pbmcgcmVjZWl2ZXIgc2V0dXAgaW5pdGlhbCBzdGF0ZS4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVvcyA9IGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuICAgICAgICBhd2FpdCB0aGlzLnJlZ2lzdGVyQWNjb3VudHMoZW9zKTtcbiAgICAgICAgYXdhaXQgdGhpcy5kZXBsb3koZW9zKTtcbiAgICAgICAgYXdhaXQgdGhpcy5ncmFudFBlcm1pc3Npb25zKGVvcyk7XG4gICAgfVxuXG5cbiAgICBhc3luYyByZWdpc3RlckFjY291bnRzKGVvczogYW55KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMucHJvdmlkZXIucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCB0aGlzLnphcC5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMudG9rZW4ucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCB0aGlzLnVzZXIucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFzeW5jIGlzc3VlVG9rZW5zKGVvczogYW55KSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBuZXcgVHJhbnNhY3Rpb24oKVxuICAgICAgICAgICAgLnNlbmRlcih0aGlzLnRva2VuKVxuICAgICAgICAgICAgLnJlY2VpdmVyKHRoaXMudG9rZW4pXG4gICAgICAgICAgICAuYWN0aW9uKCdpc3N1ZScpXG4gICAgICAgICAgICAuZGF0YSh7dG86IHRoaXMudXNlci5uYW1lLCBxdWFudGl0eTogJzEwMDAwMDAgVFNUJywgbWVtbzogJyd9KVxuICAgICAgICAgICAgLmV4ZWN1dGUoZW9zKTtcbiAgICB9XG5cbiAgICBhc3luYyBkZXBsb3koZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGRlcGxveWVyID0gbmV3IERlcGxveWVyKHtlb3M6IGVvcywgY29udHJhY3RfbmFtZTogJ21haW4nfSk7XG4gICAgICAgIGRlcGxveWVyLmZyb20odGhpcy56YXApO1xuICAgICAgICBkZXBsb3llci5hYmkoQmluYXJpZXMubWFpbkFiaSk7XG4gICAgICAgIGRlcGxveWVyLndhc20oQmluYXJpZXMubWFpbldhc20pO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgZGVwbG95ZXIuZGVwbG95KCkpO1xuXG4gICAgICAgIGxldCBjcmVhdGVUb2tlblRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKClcbiAgICAgICAgICAgIC5zZW5kZXIodGhpcy50b2tlbilcbiAgICAgICAgICAgIC5yZWNlaXZlcih0aGlzLnRva2VuKVxuICAgICAgICAgICAgLmFjdGlvbignY3JlYXRlJylcbiAgICAgICAgICAgIC5kYXRhKHtpc3N1ZXI6IHRoaXMudG9rZW4ubmFtZSwgbWF4aW11bV9zdXBwbHk6ICcxMDAwMDAwMDAwIFRTVCd9KTtcblxuICAgICAgICByZXN1bHRzLnB1c2goXG4gICAgICAgICAgICBhd2FpdCBuZXcgRGVwbG95ZXIoe2VvczogZW9zLCBjb250cmFjdF9uYW1lOiAnZW9zaW8udG9rZW4nfSlcbiAgICAgICAgICAgICAgICAuZnJvbSh0aGlzLnRva2VuKVxuICAgICAgICAgICAgICAgIC5hYmkoQmluYXJpZXMudG9rZW5BYmkpXG4gICAgICAgICAgICAgICAgLndhc20oQmluYXJpZXMudG9rZW5XYXNtKVxuICAgICAgICAgICAgICAgIC5hZnRlckRlcGxveShjcmVhdGVUb2tlblRyYW5zYWN0aW9uKVxuICAgICAgICAgICAgICAgIC5kZXBsb3koKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFzeW5jIGdyYW50UGVybWlzc2lvbnMoZW9zOiBhbnkpIHtcbiAgICAgICAgbGV0IG5ld1Blcm1pc3Npb24gPSB7XG4gICAgICAgICAgICBwZXJtaXNzaW9uOiB7XG4gICAgICAgICAgICAgICAgYWN0b3I6IHRoaXMuemFwLm5hbWUsXG4gICAgICAgICAgICAgICAgcGVybWlzc2lvbjogJ2Vvc2lvLmNvZGUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2VpZ2h0OiAxXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHVzZXIgPSBhd2FpdCBlb3MuZ2V0QWNjb3VudCh0aGlzLnVzZXIubmFtZSk7XG4gICAgICAgIGxldCBtYWluID0gYXdhaXQgZW9zLmdldEFjY291bnQodGhpcy56YXAubmFtZSk7XG5cbiAgICAgICAgbGV0IG5ld1VzZXJBdXRoID0gdXNlci5wZXJtaXNzaW9uc1tmaW5kRWxlbWVudCh1c2VyLnBlcm1pc3Npb25zLCAncGVybV9uYW1lJywgJ2FjdGl2ZScpXTtcbiAgICAgICAgbmV3VXNlckF1dGgucmVxdWlyZWRfYXV0aC5hY2NvdW50cy5wdXNoKG5ld1Blcm1pc3Npb24pO1xuXG4gICAgICAgIGxldCBuZXdNYWluQXV0aCA9IG1haW4ucGVybWlzc2lvbnNbZmluZEVsZW1lbnQobWFpbi5wZXJtaXNzaW9ucywgJ3Blcm1fbmFtZScsICdhY3RpdmUnKV07XG4gICAgICAgIG5ld01haW5BdXRoLnJlcXVpcmVkX2F1dGguYWNjb3VudHMucHVzaChuZXdQZXJtaXNzaW9uKTtcblxuICAgICAgICBhd2FpdCBlb3MudHJhbnNhY3Rpb24oKHRyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB0ci51cGRhdGVhdXRoKHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogdXNlci5hY2NvdW50X25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb246ICdhY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdvd25lcicsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IG5ld1VzZXJBdXRoLnJlcXVpcmVkX2F1dGhcbiAgICAgICAgICAgICAgICB9LCB7YXV0aG9yaXphdGlvbjogYCR7dXNlci5hY2NvdW50X25hbWV9QG93bmVyYH0pO1xuXG4gICAgICAgICAgICAgICAgdHIudXBkYXRlYXV0aCh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG1haW4uYWNjb3VudF9uYW1lLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiAnb3duZXInLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiBuZXdNYWluQXV0aC5yZXF1aXJlZF9hdXRoXG4gICAgICAgICAgICAgICAgfSwge2F1dGhvcml6YXRpb246IGAke21haW4uYWNjb3VudF9uYW1lfUBvd25lcmB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXRQcm92aWRlckFjY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3ZpZGVyO1xuICAgIH1cblxuICAgIGdldFVzZXJBY2NvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy51c2VyO1xuICAgIH1cbiAgICBnZXRUb2tlbkFjY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRva2VuO1xuICAgIH1cbn1cbiJdfQ==