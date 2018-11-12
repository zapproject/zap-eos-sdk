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
        //this.zap = new Account('main');
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
            const deployer = new eos_utils_1.Deployer({ eos: eos, contract_name: this.zap.name });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L2Vudmlyb25tZW50LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL2JvbmRhZ2Uvc3JjL3Rlc3QvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsZ0RBQThHO0FBQzlHLGlEQUFnRDtBQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNsRCxzREFBK0M7QUFJL0MsMkJBQTJCO0FBQzNCLE1BQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDLENBQUEsZ0RBQWdEO0FBQzVGLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQ2pDLE1BQU0sU0FBUyxHQUFHLE9BQU8sR0FBRyw4QkFBOEIsQ0FBQztBQUMzRCxNQUFNLGlCQUFpQixHQUFHLHFEQUFxRCxDQUFDO0FBQ2hGLGtGQUFrRjtBQUNsRixNQUFNLGtCQUFrQixHQUFHLHFEQUFxRCxDQUFDO0FBSWpGLG1CQUFtQixLQUFzQixFQUFFLElBQVk7SUFDbkQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRSxNQUFNO1FBQ3ZDLGtCQUFrQixJQUFTO1lBQ3ZCLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDO1FBRUQsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBQ0QscUJBQXFCLEtBQWlCLEVBQUUs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QUksQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDekYsV0FBVyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXZELE1BQU0sR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQU8sRUFBRSxFQUFFO2dCQUM1QixFQUFFLENBQUMsVUFBVSxDQUFDO29CQUNWLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDMUIsVUFBVSxFQUFFLFFBQVE7b0JBQ3BCLE1BQU0sRUFBRSxPQUFPO29CQUNmLElBQUksRUFBRSxXQUFXLENBQUMsYUFBYTtpQkFDbEMsRUFBRSxFQUFDLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLFFBQVEsRUFBQyxDQUFDLENBQUM7Z0JBR25ELEVBQUUsQ0FBQyxVQUFVLENBQUM7b0JBQ1QsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMxQixVQUFVLEVBQUUsUUFBUTtvQkFDcEIsTUFBTSxFQUFFLE9BQU87b0JBQ2YsSUFBSSxFQUFFLFdBQVcsQ0FBQyxhQUFhO2lCQUNsQyxFQUFFLEVBQUMsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksUUFBUSxFQUFDLENBQUMsQ0FBQztZQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtDQUNKO0FBekpELDRCQXlKQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQgeyBBY2NvdW50LCBOb2RlLCBEZXBsb3llciwgVHJhbnNhY3Rpb24sIFNpbXBsZUV2ZW50TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lciB9IGZyb20gJ0B6YXBqcy9lb3MtdXRpbHMnO1xuaW1wb3J0IHsgc3Bhd24sIGV4ZWNTeW5jIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5jb25zdCBQUk9KRUNUX1BBVEggPSBwYXRoLmpvaW4oX19kaXJuYW1lICsgJy8uLicpO1xuaW1wb3J0IHsgQmluYXJpZXMgfSBmcm9tIFwiQHphcGpzL2Vvcy1iaW5hcmllc1wiO1xuaW1wb3J0ICogYXMgc3RyZWFtIGZyb20gXCJzdHJlYW1cIjtcblxuXG4vL1RPRE86IHJlY2VpdmUgZHluYW1pY2FsbHlcbmNvbnN0IE5PREVPU19QQVRIID0gJy91c3IvbG9jYWwvYmluL25vZGVvcyc7Ly8nL2hvbWUvdXNlci9lb3MvYnVpbGQvcHJvZ3JhbXMvbm9kZW9zL25vZGVvcyc7XG5jb25zdCBFT1NfRElSID0gJy9ob21lL3VzZXIvZW9zJztcbmNvbnN0IFRPS0VOX0RJUiA9IEVPU19ESVIgKyAnL2J1aWxkL2NvbnRyYWN0cy9lb3Npby50b2tlbic7XG5jb25zdCBBQ0NfVEVTVF9QUklWX0tFWSA9ICc1S2ZGdWZuVVRoYUVlcXNTZU1QdDI3UG9hbjVnOExVYUVvcnNDMWhIbTFGZ05KZnIzc1gnO1xuLy9jb25zdCBBQ0NfVEVTVF9QUklWX0tFWSA9ICc1S1F3clBid2RMNlBoWHVqeFczN0ZTU1FaMUppd3NTVDRjcVF6RGV5WHRQNzl6a3ZGRDMnO1xuY29uc3QgQUNDX09XTkVSX1BSSVZfS0VZID0gJzVLUXdyUGJ3ZEw2UGhYdWp4VzM3RlNTUVoxSml3c1NUNGNxUXpEZXlYdFA3OXprdkZEMyc7XG5cblxuXG5mdW5jdGlvbiB3YWl0RXZlbnQoZXZlbnQ6IHN0cmVhbS5SZWFkYWJsZSwgdHlwZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcihkYXRhOiBhbnkpIHtcbiAgICAgICAgICAgIGV2ZW50LnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBldmVudC5vbih0eXBlLCBsaXN0ZW5lcik7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBmaW5kRWxlbWVudChhcnJheTogQXJyYXk8YW55PiwgZmllbGQ6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIGZvciAobGV0IGkgaW4gYXJyYXkpIHtcbiAgICAgICAgaWYgKGFycmF5Lmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV1bZmllbGRdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xufVxuZXhwb3J0IGNsYXNzIFRlc3ROb2RlIGV4dGVuZHMgTm9kZSB7XG4gICAgcmVjb21waWxlOiBib29sZWFuO1xuICAgIHJ1bm5pbmc6IGJvb2xlYW47XG4gICAgemFwOiBBY2NvdW50O1xuICAgIG5vZGVvc19wYXRoOiBzdHJpbmc7XG4gICAgaW5zdGFuY2U6IGFueTtcbiAgICBhY2NvdW50X3VzZXI6IEFjY291bnQ7XG4gICAgYWNjb3VudF90b2tlbjogQWNjb3VudDtcbiAgICBhY2NvdW50X3Byb3ZpZGVyOiBBY2NvdW50O1xuXG4gICAgY29uc3RydWN0b3IodmVyYm9zZTogYm9vbGVhbiwgcmVjb21waWxlOiBib29sZWFuLCBlbmRwb2ludDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHt2ZXJib3NlOiB2ZXJib3NlLCBrZXlfcHJvdmlkZXI6IFtBQ0NfVEVTVF9QUklWX0tFWSwgQUNDX09XTkVSX1BSSVZfS0VZXSwgaHR0cF9lbmRwb2ludDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODg4OCcsIGNoYWluX2lkOiAnJ30pO1xuICAgICAgICB0aGlzLnJlY29tcGlsZSA9IHJlY29tcGlsZTtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICB0aGlzLm5vZGVvc19wYXRoID0gTk9ERU9TX1BBVEg7XG4gICAgICAgIHRoaXMuemFwID0gdGhpcy5nZXRaYXBBY2NvdW50KCk7XG4gICAgICAgIHRoaXMuYWNjb3VudF91c2VyID0gbmV3IEFjY291bnQoJ3VzZXInKTtcbiAgICAgICAgLy90aGlzLnphcCA9IG5ldyBBY2NvdW50KCdtYWluJyk7XG4gICAgICAgIHRoaXMuYWNjb3VudF90b2tlbiA9IG5ldyBBY2NvdW50KCd0b2tlbicpO1xuICAgICAgICB0aGlzLmFjY291bnRfcHJvdmlkZXIgPSBuZXcgQWNjb3VudCgncHJvdmlkZXInKTtcbiAgICAgICAgdGhpcy56YXAudXNlUHJpdmF0ZUtleShBQ0NfT1dORVJfUFJJVl9LRVkpO1xuICAgICAgICB0aGlzLmFjY291bnRfdXNlci51c2VQcml2YXRlS2V5KEFDQ19URVNUX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3Rva2VuLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3Byb3ZpZGVyLnVzZVByaXZhdGVLZXkoQUNDX1RFU1RfUFJJVl9LRVkpO1xuXG4gICAgfVxuICAgIGdldEFjY291bnRzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjb3VudF91c2VyOiB0aGlzLmFjY291bnRfdXNlcixcbiAgICAgICAgICAgIGFjY291bnRfcHJvdmlkZXI6IHRoaXMuYWNjb3VudF9wcm92aWRlcixcbiAgICAgICAgICAgIGFjY291bnRfdG9rZW46IHRoaXMuYWNjb3VudF90b2tlbixcbiAgICAgICAgICAgIHphcDogdGhpcy56YXBcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYyBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rlc3QgRU9TIG5vZGUgaXMgYWxyZWFkeSBydW5uaW5nLicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHVzZSBzcGF3biBmdW5jdGlvbiBiZWNhdXNlIG5vZGVvcyBoYXMgaW5maW5pdHkgb3V0cHV0XG4gICAgICB0aGlzLmluc3RhbmNlID0gc3Bhd24odGhpcy5ub2Rlb3NfcGF0aCwgWyctZSAtcCBlb3NpbycsICctLWRlbGV0ZS1hbGwtYmxvY2tzJywgJy0tcGx1Z2luIGVvc2lvOjpwcm9kdWNlcl9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omhpc3RvcnlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpjaGFpbl9hcGlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpoaXN0b3J5X2FwaV9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omh0dHBfcGx1Z2luJ10sIHtzaGVsbDogdHJ1ZX0pO1xuICAgICAgLy90aGlzLmluc3RhbmNlID0gc3Bhd24oJ2RvY2tlcicsIFsncnVuJywgJ2Vvc2lvJywgJy0tZGVsZXRlLWFsbC1ibG9ja3MnXSk7XG5cbiAgICAgICAgLy8gd2FpdCB1bnRpbCBub2RlIGlzIHJ1bm5pbmdcblxuICAgICAgICB3aGlsZSAodGhpcy5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYXdhaXQgd2FpdEV2ZW50KHRoaXMuaW5zdGFuY2Uuc3RkZXJyLCAnZGF0YScpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudmVyYm9zZSkgY29uc29sZS5sb2coJ0VvcyBub2RlIGlzIHJ1bm5pbmcuJylcbiAgICB9XG5cbiAgICBraWxsKCkge1xuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5raWxsKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmVyYm9zZSkgY29uc29sZS5sb2coJ0VvcyBub2RlIGtpbGxlZC4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICBhc3luYyByZXN0YXJ0KCkge1xuICAgICAgICAgdGhpcy5raWxsKCk7XG4gICAgICAgICBhd2FpdCB0aGlzLnJ1bigpO1xuICAgICB9XG5cblxuICAgIGFzeW5jIGluaXQoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW9zIG5vZGUgbXVzdCBydW5uaW5nIHJlY2VpdmVyIHNldHVwIGluaXRpYWwgc3RhdGUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWdpc3RlckFjY291bnRzKGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuZGVwbG95KGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuZGVwbG95VG9rZW4oZW9zKTtcbiAgICAgICAgYXdhaXQgdGhpcy5ncmFudFBlcm1pc3Npb25zKGVvcyk7XG4gICAgICAgIHJldHVybiBlb3M7XG4gICAgfVxuXG5cbiAgICBhc3luYyByZWdpc3RlckFjY291bnRzKGVvczogYW55KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuemFwLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy5hY2NvdW50X3Rva2VuLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy5hY2NvdW50X3Byb3ZpZGVyLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy5hY2NvdW50X3VzZXIucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFzeW5jIGRlcGxveShlb3M6IGFueSkge1xuICAgICAgICBjb25zdCByZXN1bHRzOiBhbnkgPSBbXTtcbiAgICAgICAgY29uc3QgZGVwbG95ZXIgPSBuZXcgRGVwbG95ZXIoe2VvczogZW9zLCBjb250cmFjdF9uYW1lOiB0aGlzLnphcC5uYW1lfSk7XG4gICAgICAgIGRlcGxveWVyLmZyb20odGhpcy56YXApO1xuICAgICAgICBkZXBsb3llci5hYmkoQmluYXJpZXMubWFpbkFiaSk7XG4gICAgICAgIGRlcGxveWVyLndhc20oQmluYXJpZXMubWFpbldhc20pO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgZGVwbG95ZXIuZGVwbG95KCkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gICAgYXN5bmMgZGVwbG95VG9rZW4oZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGRlcGxveWVyID0gbmV3IERlcGxveWVyKHtlb3M6IGVvcywgY29udHJhY3RfbmFtZTogJ2Vvc2lvLnRva2VuJ30pO1xuICAgICAgICBsZXQgY3JlYXRlVG9rZW5UcmFuc2FjdGlvbiA9IG5ldyBUcmFuc2FjdGlvbigpXG4gICAgICAgICAgICAuc2VuZGVyKHRoaXMuYWNjb3VudF90b2tlbilcbiAgICAgICAgICAgIC5yZWNlaXZlcih0aGlzLmFjY291bnRfdG9rZW4pXG4gICAgICAgICAgICAuYWN0aW9uKCdjcmVhdGUnKVxuICAgICAgICAgICAgLmRhdGEoe2lzc3VlcjogdGhpcy5hY2NvdW50X3Rva2VuLm5hbWUsIG1heGltdW1fc3VwcGx5OiAnMTAwMDAwMDAwMCBUU1QnfSk7XG4gICAgICAgIGRlcGxveWVyLmZyb20odGhpcy5hY2NvdW50X3Rva2VuKTtcbiAgICAgICAgZGVwbG95ZXIuYWJpKEJpbmFyaWVzLnRva2VuQWJpKTtcbiAgICAgICAgZGVwbG95ZXIud2FzbShCaW5hcmllcy50b2tlbldhc20pO1xuICAgICAgICBkZXBsb3llci5hZnRlckRlcGxveShjcmVhdGVUb2tlblRyYW5zYWN0aW9uKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IGRlcGxveWVyLmRlcGxveSgpKTtcbiAgICB9XG4gICAgYXN5bmMgZ3JhbnRQZXJtaXNzaW9ucyhlb3M6IGFueSkge1xuICAgICAgICBsZXQgbmV3UGVybWlzc2lvbiA9IHtcbiAgICAgICAgICAgIHBlcm1pc3Npb246IHtcbiAgICAgICAgICAgICAgICBhY3RvcjogJ3phcC5tYWluJyxcbiAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnZW9zaW8uY29kZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3ZWlnaHQ6IDFcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgdXNlciA9IGF3YWl0IGVvcy5nZXRBY2NvdW50KHRoaXMuYWNjb3VudF91c2VyLm5hbWUpO1xuICAgICAgICBsZXQgbWFpbiA9IGF3YWl0IGVvcy5nZXRBY2NvdW50KHRoaXMuemFwLm5hbWUpO1xuXG4gICAgICAgIGxldCBuZXdVc2VyQXV0aCA9IHVzZXIucGVybWlzc2lvbnNbZmluZEVsZW1lbnQodXNlci5wZXJtaXNzaW9ucywgJ3Blcm1fbmFtZScsICdhY3RpdmUnKV07XG4gICAgICAgIG5ld1VzZXJBdXRoLnJlcXVpcmVkX2F1dGguYWNjb3VudHMucHVzaChuZXdQZXJtaXNzaW9uKTtcblxuICAgICAgICBsZXQgbmV3TWFpbkF1dGggPSBtYWluLnBlcm1pc3Npb25zW2ZpbmRFbGVtZW50KG1haW4ucGVybWlzc2lvbnMsICdwZXJtX25hbWUnLCAnYWN0aXZlJyldO1xuICAgICAgICBuZXdNYWluQXV0aC5yZXF1aXJlZF9hdXRoLmFjY291bnRzLnB1c2gobmV3UGVybWlzc2lvbik7XG5cbiAgICAgICAgYXdhaXQgZW9zLnRyYW5zYWN0aW9uKCh0cjogYW55KSA9PiB7XG4gICAgICAgICAgICAgIHRyLnVwZGF0ZWF1dGgoe1xuICAgICAgICAgICAgICAgICAgYWNjb3VudDogdXNlci5hY2NvdW50X25hbWUsXG4gICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogJ293bmVyJyxcbiAgICAgICAgICAgICAgICAgIGF1dGg6IG5ld1VzZXJBdXRoLnJlcXVpcmVkX2F1dGhcbiAgICAgICAgICAgICAgfSwge2F1dGhvcml6YXRpb246IGAke3VzZXIuYWNjb3VudF9uYW1lfUBvd25lcmB9KTtcblxuXG4gICAgICAgICAgICAgdHIudXBkYXRlYXV0aCh7XG4gICAgICAgICAgICAgICAgICBhY2NvdW50OiBtYWluLmFjY291bnRfbmFtZSxcbiAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb246ICdhY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgcGFyZW50OiAnb3duZXInLFxuICAgICAgICAgICAgICAgICAgYXV0aDogbmV3TWFpbkF1dGgucmVxdWlyZWRfYXV0aFxuICAgICAgICAgICAgICB9LCB7YXV0aG9yaXphdGlvbjogYCR7bWFpbi5hY2NvdW50X25hbWV9QG93bmVyYH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=