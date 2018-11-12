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
        super({ verbose: verbose, key_provider: [ACC_TEST_PRIV_KEY, ACC_OWNER_PRIV_KEY], http_endpoint: 'http://127.0.0.1:8888', chain_id: '' });
        this.recompile = recompile;
        this.running = false;
        this.instance = null;
        this.nodeos_path = NODEOS_PATH;
        this.zap = this.getZapAccount();
        this.account_user = new eos_utils_1.Account('user');
        this.account_token = new eos_utils_1.Account('zap.token');
        this.account_provider = new eos_utils_1.Account('zap.provider');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L2Vudmlyb25tZW50LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL2JvbmRhZ2Uvc3JjL3Rlc3QvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsZ0RBQThHO0FBQzlHLGlEQUFnRDtBQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNsRCxzREFBK0M7QUFJL0MsMkJBQTJCO0FBQzNCLE1BQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDLENBQUEsZ0RBQWdEO0FBQzVGLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQ2pDLE1BQU0sU0FBUyxHQUFHLE9BQU8sR0FBRyw4QkFBOEIsQ0FBQztBQUMzRCxNQUFNLGlCQUFpQixHQUFHLHFEQUFxRCxDQUFDO0FBQ2hGLGtGQUFrRjtBQUNsRixNQUFNLGtCQUFrQixHQUFHLHFEQUFxRCxDQUFDO0FBSWpGLG1CQUFtQixLQUFzQixFQUFFLElBQVk7SUFDbkQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRSxNQUFNO1FBQ3ZDLGtCQUFrQixJQUFTO1lBQ3ZCLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDO1FBRUQsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBQ0QscUJBQXFCLEtBQWlCLEVBQUUs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Q0FBQyxDQUFDLENBQUM7WUFDekYsV0FBVyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXZELE1BQU0sR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQU8sRUFBRSxFQUFFO2dCQUM1QixFQUFFLENBQUMsVUFBVSxDQUFDO29CQUNWLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDMUIsVUFBVSxFQUFFLFFBQVE7b0JBQ3BCLE1BQU0sRUFBRSxPQUFPO29CQUNmLElBQUksRUFBRSxXQUFXLENBQUMsYUFBYTtpQkFDbEMsRUFBRSxFQUFDLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLFFBQVEsRUFBQyxDQUFDLENBQUM7Z0JBR25ELEVBQUUsQ0FBQyxVQUFVLENBQUM7b0JBQ1QsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMxQixVQUFVLEVBQUUsUUFBUTtvQkFDcEIsTUFBTSxFQUFFLE9BQU87b0JBQ2YsSUFBSSxFQUFFLFdBQVcsQ0FBQyxhQUFhO2lCQUNsQyxFQUFFLEVBQUMsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksUUFBUSxFQUFDLENBQUMsQ0FBQztZQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtDQUNKO0FBeEpELDRCQXdKQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQgeyBBY2NvdW50LCBOb2RlLCBEZXBsb3llciwgVHJhbnNhY3Rpb24sIFNpbXBsZUV2ZW50TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lciB9IGZyb20gJ0B6YXBqcy9lb3MtdXRpbHMnO1xuaW1wb3J0IHsgc3Bhd24sIGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5jb25zdCBQUk9KRUNUX1BBVEggPSBwYXRoLmpvaW4oX19kaXJuYW1lICsgJy8uLicpO1xuaW1wb3J0IHsgQmluYXJpZXMgfSBmcm9tIFwiQHphcGpzL2Vvcy1iaW5hcmllc1wiO1xuaW1wb3J0ICogYXMgc3RyZWFtIGZyb20gXCJzdHJlYW1cIjtcblxuXG4vL1RPRE86IHJlY2VpdmUgZHluYW1pY2FsbHlcbmNvbnN0IE5PREVPU19QQVRIID0gJy91c3IvbG9jYWwvYmluL25vZGVvcyc7Ly8nL2hvbWUvdXNlci9lb3MvYnVpbGQvcHJvZ3JhbXMvbm9kZW9zL25vZGVvcyc7XG5jb25zdCBFT1NfRElSID0gJy9ob21lL3VzZXIvZW9zJztcbmNvbnN0IFRPS0VOX0RJUiA9IEVPU19ESVIgKyAnL2J1aWxkL2NvbnRyYWN0cy9lb3Npby50b2tlbic7XG5jb25zdCBBQ0NfVEVTVF9QUklWX0tFWSA9ICc1S2ZGdWZuVVRoYUVlcXNTZU1QdDI3UG9hbjVnOExVYUVvcnNDMWhIbTFGZ05KZnIzc1gnO1xuLy9jb25zdCBBQ0NfVEVTVF9QUklWX0tFWSA9ICc1S1F3clBid2RMNlBoWHVqeFczN0ZTU1FaMUppd3NTVDRjcVF6RGV5WHRQNzl6a3ZGRDMnO1xuY29uc3QgQUNDX09XTkVSX1BSSVZfS0VZID0gJzVLUXdyUGJ3ZEw2UGhYdWp4VzM3RlNTUVoxSml3c1NUNGNxUXpEZXlYdFA3OXprdkZEMyc7XG5cblxuXG5mdW5jdGlvbiB3YWl0RXZlbnQoZXZlbnQ6IHN0cmVhbS5SZWFkYWJsZSwgdHlwZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcihkYXRhOiBhbnkpIHtcbiAgICAgICAgICAgIGV2ZW50LnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBldmVudC5vbih0eXBlLCBsaXN0ZW5lcik7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBmaW5kRWxlbWVudChhcnJheTogQXJyYXk8YW55PiwgZmllbGQ6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIGZvciAobGV0IGkgaW4gYXJyYXkpIHtcbiAgICAgICAgaWYgKGFycmF5Lmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV1bZmllbGRdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xufVxuZXhwb3J0IGNsYXNzIFRlc3ROb2RlIGV4dGVuZHMgTm9kZSB7XG4gICAgcmVjb21waWxlOiBib29sZWFuO1xuICAgIHJ1bm5pbmc6IGJvb2xlYW47XG4gICAgemFwOiBBY2NvdW50O1xuICAgIG5vZGVvc19wYXRoOiBzdHJpbmc7XG4gICAgaW5zdGFuY2U6IGFueTtcbiAgICBhY2NvdW50X3VzZXI6IEFjY291bnQ7XG4gICAgYWNjb3VudF90b2tlbjogQWNjb3VudDtcbiAgICBhY2NvdW50X3Byb3ZpZGVyOiBBY2NvdW50O1xuXG4gICAgY29uc3RydWN0b3IodmVyYm9zZTogYm9vbGVhbiwgcmVjb21waWxlOiBib29sZWFuLCBlbmRwb2ludDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHt2ZXJib3NlOiB2ZXJib3NlLCBrZXlfcHJvdmlkZXI6IFtBQ0NfVEVTVF9QUklWX0tFWSwgQUNDX09XTkVSX1BSSVZfS0VZXSwgaHR0cF9lbmRwb2ludDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODg4OCcsIGNoYWluX2lkOiAnJ30pO1xuICAgICAgICB0aGlzLnJlY29tcGlsZSA9IHJlY29tcGlsZTtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICB0aGlzLm5vZGVvc19wYXRoID0gTk9ERU9TX1BBVEg7XG4gICAgICAgIHRoaXMuemFwID0gdGhpcy5nZXRaYXBBY2NvdW50KCk7XG4gICAgICAgIHRoaXMuYWNjb3VudF91c2VyID0gbmV3IEFjY291bnQoJ3VzZXInKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3Rva2VuID0gbmV3IEFjY291bnQoJ3phcC50b2tlbicpO1xuICAgICAgICB0aGlzLmFjY291bnRfcHJvdmlkZXIgPSBuZXcgQWNjb3VudCgnemFwLnByb3ZpZGVyJyk7XG4gICAgICAgIHRoaXMuemFwLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3VzZXIudXNlUHJpdmF0ZUtleShBQ0NfVEVTVF9QUklWX0tFWSk7XG4gICAgICAgIHRoaXMuYWNjb3VudF90b2tlbi51c2VQcml2YXRlS2V5KEFDQ19PV05FUl9QUklWX0tFWSk7XG4gICAgICAgIHRoaXMuYWNjb3VudF9wcm92aWRlci51c2VQcml2YXRlS2V5KEFDQ19URVNUX1BSSVZfS0VZKTtcblxuICAgIH1cbiAgICBnZXRBY2NvdW50cygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFjY291bnRfdXNlcjogdGhpcy5hY2NvdW50X3VzZXIsXG4gICAgICAgICAgICBhY2NvdW50X3Byb3ZpZGVyOiB0aGlzLmFjY291bnRfcHJvdmlkZXIsXG4gICAgICAgICAgICBhY2NvdW50X3Rva2VuOiB0aGlzLmFjY291bnRfdG9rZW4sXG4gICAgICAgICAgICB6YXA6IHRoaXMuemFwXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXN0IEVPUyBub2RlIGlzIGFscmVhZHkgcnVubmluZy4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB1c2Ugc3Bhd24gZnVuY3Rpb24gYmVjYXVzZSBub2Rlb3MgaGFzIGluZmluaXR5IG91dHB1dFxuICAgICAgdGhpcy5pbnN0YW5jZSA9IHNwYXduKHRoaXMubm9kZW9zX3BhdGgsIFsnLWUgLXAgZW9zaW8nLCAnLS1kZWxldGUtYWxsLWJsb2NrcycsICctLXBsdWdpbiBlb3Npbzo6cHJvZHVjZXJfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpoaXN0b3J5X3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6Y2hhaW5fYXBpX3BsdWdpbicsICctLXBsdWdpbiBlb3Npbzo6aGlzdG9yeV9hcGlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpodHRwX3BsdWdpbiddLCB7c2hlbGw6IHRydWV9KTtcbiAgICAgIC8vdGhpcy5pbnN0YW5jZSA9IHNwYXduKCdkb2NrZXInLCBbJ3J1bicsICdlb3NpbycsICctLWRlbGV0ZS1hbGwtYmxvY2tzJ10pO1xuXG4gICAgICAgIC8vIHdhaXQgdW50aWwgbm9kZSBpcyBydW5uaW5nXG5cbiAgICAgICAgd2hpbGUgKHRoaXMucnVubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGF3YWl0IHdhaXRFdmVudCh0aGlzLmluc3RhbmNlLnN0ZGVyciwgJ2RhdGEnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnZlcmJvc2UpIGNvbnNvbGUubG9nKCdFb3Mgbm9kZSBpcyBydW5uaW5nLicpXG4gICAgfVxuXG4gICAga2lsbCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2Uua2lsbCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZlcmJvc2UpIGNvbnNvbGUubG9nKCdFb3Mgbm9kZSBraWxsZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAgYXN5bmMgcmVzdGFydCgpIHtcbiAgICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgICAgYXdhaXQgdGhpcy5ydW4oKTtcbiAgICAgfVxuXG5cbiAgICBhc3luYyBpbml0KCkge1xuXG4gICAgICAgIGlmICghdGhpcy5ydW5uaW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VvcyBub2RlIG11c3QgcnVubmluZyByZWNlaXZlciBzZXR1cCBpbml0aWFsIHN0YXRlLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW9zID0gYXdhaXQgdGhpcy5jb25uZWN0KCk7XG4gICAgICAgIGF3YWl0IHRoaXMucmVnaXN0ZXJBY2NvdW50cyhlb3MpO1xuICAgICAgICBhd2FpdCB0aGlzLmRlcGxveShlb3MpO1xuICAgICAgICBhd2FpdCB0aGlzLmRlcGxveVRva2VuKGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuZ3JhbnRQZXJtaXNzaW9ucyhlb3MpO1xuICAgICAgICByZXR1cm4gZW9zO1xuICAgIH1cblxuXG4gICAgYXN5bmMgcmVnaXN0ZXJBY2NvdW50cyhlb3M6IGFueSkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCB0aGlzLnphcC5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuYWNjb3VudF90b2tlbi5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuYWNjb3VudF9wcm92aWRlci5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuYWNjb3VudF91c2VyLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBhc3luYyBkZXBsb3koZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGRlcGxveWVyID0gbmV3IERlcGxveWVyKHtlb3M6IGVvcywgY29udHJhY3RfbmFtZTogJ21haW4nfSk7XG4gICAgICAgIGRlcGxveWVyLmZyb20odGhpcy56YXApO1xuICAgICAgICBkZXBsb3llci5hYmkoQmluYXJpZXMubWFpbkFiaSk7XG4gICAgICAgIGRlcGxveWVyLndhc20oQmluYXJpZXMubWFpbldhc20pO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgZGVwbG95ZXIuZGVwbG95KCkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gICAgYXN5bmMgZGVwbG95VG9rZW4oZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGRlcGxveWVyID0gbmV3IERlcGxveWVyKHtlb3M6IGVvcywgY29udHJhY3RfbmFtZTogJ2Vvc2lvLnRva2VuJ30pO1xuICAgICAgICBsZXQgY3JlYXRlVG9rZW5UcmFuc2FjdGlvbiA9IG5ldyBUcmFuc2FjdGlvbigpXG4gICAgICAgICAgICAuc2VuZGVyKHRoaXMuYWNjb3VudF90b2tlbilcbiAgICAgICAgICAgIC5yZWNlaXZlcih0aGlzLmFjY291bnRfdG9rZW4pXG4gICAgICAgICAgICAuYWN0aW9uKCdjcmVhdGUnKVxuICAgICAgICAgICAgLmRhdGEoe2lzc3VlcjogdGhpcy5hY2NvdW50X3Rva2VuLm5hbWUsIG1heGltdW1fc3VwcGx5OiAnMTAwMDAwMDAwMCBUU1QnfSk7XG4gICAgICAgIGRlcGxveWVyLmZyb20odGhpcy5hY2NvdW50X3Rva2VuKTtcbiAgICAgICAgZGVwbG95ZXIuYWJpKEJpbmFyaWVzLnRva2VuQWJpKTtcbiAgICAgICAgZGVwbG95ZXIud2FzbShCaW5hcmllcy50b2tlbldhc20pO1xuICAgICAgICBkZXBsb3llci5hZnRlckRlcGxveShjcmVhdGVUb2tlblRyYW5zYWN0aW9uKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IGRlcGxveWVyLmRlcGxveSgpKTtcbiAgICB9XG4gICAgYXN5bmMgZ3JhbnRQZXJtaXNzaW9ucyhlb3M6IGFueSkge1xuICAgICAgICBsZXQgbmV3UGVybWlzc2lvbiA9IHtcbiAgICAgICAgICAgIHBlcm1pc3Npb246IHtcbiAgICAgICAgICAgICAgICBhY3RvcjogJ3phcC5tYWluJyxcbiAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnZW9zaW8uY29kZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3ZWlnaHQ6IDFcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgdXNlciA9IGF3YWl0IGVvcy5nZXRBY2NvdW50KHRoaXMuYWNjb3VudF91c2VyLm5hbWUpO1xuICAgICAgICBsZXQgbWFpbiA9IGF3YWl0IGVvcy5nZXRBY2NvdW50KHRoaXMuemFwLm5hbWUpO1xuXG4gICAgICAgIGxldCBuZXdVc2VyQXV0aCA9IHVzZXIucGVybWlzc2lvbnNbZmluZEVsZW1lbnQodXNlci5wZXJtaXNzaW9ucywgJ3Blcm1fbmFtZScsICdhY3RpdmUnKV07XG4gICAgICAgIG5ld1VzZXJBdXRoLnJlcXVpcmVkX2F1dGguYWNjb3VudHMucHVzaChuZXdQZXJtaXNzaW9uKTtcblxuICAgICAgICBsZXQgbmV3TWFpbkF1dGggPSBtYWluLnBlcm1pc3Npb25zW2ZpbmRFbGVtZW50KG1haW4ucGVybWlzc2lvbnMsICdwZXJtX25hbWUnLCAnYWN0aXZlJyldO1xuICAgICAgICBuZXdNYWluQXV0aC5yZXF1aXJlZF9hdXRoLmFjY291bnRzLnB1c2gobmV3UGVybWlzc2lvbik7XG5cbiAgICAgICAgYXdhaXQgZW9zLnRyYW5zYWN0aW9uKCh0cjogYW55KSA9PiB7XG4gICAgICAgICAgICAgIHRyLnVwZGF0ZWF1dGgoe1xuICAgICAgICAgICAgICAgICAgYWNjb3VudDogdXNlci5hY2NvdW50X25hbWUsXG4gICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogJ293bmVyJyxcbiAgICAgICAgICAgICAgICAgIGF1dGg6IG5ld1VzZXJBdXRoLnJlcXVpcmVkX2F1dGhcbiAgICAgICAgICAgICAgfSwge2F1dGhvcml6YXRpb246IGAke3VzZXIuYWNjb3VudF9uYW1lfUBvd25lcmB9KTtcblxuXG4gICAgICAgICAgICAgdHIudXBkYXRlYXV0aCh7XG4gICAgICAgICAgICAgICAgICBhY2NvdW50OiBtYWluLmFjY291bnRfbmFtZSxcbiAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb246ICdhY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgcGFyZW50OiAnb3duZXInLFxuICAgICAgICAgICAgICAgICAgYXV0aDogbmV3TWFpbkF1dGgucmVxdWlyZWRfYXV0aFxuICAgICAgICAgICAgICB9LCB7YXV0aG9yaXphdGlvbjogYCR7bWFpbi5hY2NvdW50X25hbWV9QG93bmVyYH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=