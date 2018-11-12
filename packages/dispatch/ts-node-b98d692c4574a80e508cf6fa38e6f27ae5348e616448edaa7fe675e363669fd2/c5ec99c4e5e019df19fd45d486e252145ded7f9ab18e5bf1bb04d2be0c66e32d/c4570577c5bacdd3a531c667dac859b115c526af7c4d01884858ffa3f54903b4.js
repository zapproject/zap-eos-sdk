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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9kaXNwYXRjaC9zcmMvdGVzdC9lbnZpcm9ubWVudC50cyIsInNvdXJjZXMiOlsiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9kaXNwYXRjaC9zcmMvdGVzdC9lbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixnREFBNEc7QUFDNUcsaURBQThDO0FBRTlDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBR2xELHNEQUErQztBQUcvQywyQkFBMkI7QUFDM0IsTUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7QUFDNUMsTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUM7QUFDakMsTUFBTSxTQUFTLEdBQUcsT0FBTyxHQUFHLDhCQUE4QixDQUFDO0FBQzNELE1BQU0saUJBQWlCLEdBQUcscURBQXFELENBQUM7QUFDaEYsTUFBTSxrQkFBa0IsR0FBRyxxREFBcUQsQ0FBQTtBQUdoRixtQkFBbUIsS0FBc0IsRUFBRSxJQUFZO0lBQ25ELE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtRQUN4QyxrQkFBa0IsSUFBUztZQUN2QixLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQztRQUVELEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELHFCQUFxQixLQUFpQixFQUFFLEtBQWEsRUFBRSxLQUFVO0lBQzdELEtB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Q1YsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMxQixVQUFVLEVBQUUsUUFBUTtvQkFDcEIsTUFBTSxFQUFFLE9BQU87b0JBQ2YsSUFBSSxFQUFFLFdBQVcsQ0FBQyxhQUFhO2lCQUNsQyxFQUFFLEVBQUMsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksUUFBUSxFQUFDLENBQUMsQ0FBQztnQkFFbEQsRUFBRSxDQUFDLFVBQVUsQ0FBQztvQkFDVixPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7b0JBQzFCLFVBQVUsRUFBRSxRQUFRO29CQUNwQixNQUFNLEVBQUUsT0FBTztvQkFDZixJQUFJLEVBQUUsV0FBVyxDQUFDLGFBQWE7aUJBQ2xDLEVBQUUsRUFBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ3RELENBQUMsQ0FDSixDQUFDO1FBQ04sQ0FBQztLQUFBO0lBRUQsa0JBQWtCO1FBQ2QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxjQUFjO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7Q0FDSjtBQWpLRCw0QkFpS0MiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHtBY2NvdW50LCBOb2RlLCBEZXBsb3llciwgVHJhbnNhY3Rpb24sIFNpbXBsZUV2ZW50TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcn0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQge3NwYXduLCBleGVjU3luY30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IFBST0pFQ1RfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUgKyAnLy4uJyk7XG5pbXBvcnQgKiBhcyBzdHJlYW0gZnJvbSBcInN0cmVhbVwiO1xuXG5pbXBvcnQgeyBCaW5hcmllcyB9IGZyb20gXCJAemFwanMvZW9zLWJpbmFyaWVzXCI7XG5cblxuLy9UT0RPOiByZWNlaXZlIGR5bmFtaWNhbGx5XG5jb25zdCBOT0RFT1NfUEFUSCA9ICcvdXNyL2xvY2FsL2Jpbi9ub2Rlb3MnO1xuY29uc3QgRU9TX0RJUiA9ICcvaG9tZS91c2VyL2Vvcyc7XG5jb25zdCBUT0tFTl9ESVIgPSBFT1NfRElSICsgJy9idWlsZC9jb250cmFjdHMvZW9zaW8udG9rZW4nO1xuY29uc3QgQUNDX1RFU1RfUFJJVl9LRVkgPSAnNUtmRnVmblVUaGFFZXFzU2VNUHQyN1BvYW41ZzhMVWFFb3JzQzFoSG0xRmdOSmZyM3NYJztcbmNvbnN0IEFDQ19PV05FUl9QUklWX0tFWSA9ICc1S1F3clBid2RMNlBoWHVqeFczN0ZTU1FaMUppd3NTVDRjcVF6RGV5WHRQNzl6a3ZGRDMnXG5cblxuZnVuY3Rpb24gd2FpdEV2ZW50KGV2ZW50OiBzdHJlYW0uUmVhZGFibGUsIHR5cGU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKGRhdGE6IGFueSkge1xuICAgICAgICAgICAgZXZlbnQucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50Lm9uKHR5cGUsIGxpc3RlbmVyKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZmluZEVsZW1lbnQoYXJyYXk6IEFycmF5PGFueT4sIGZpZWxkOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICBmb3IgKGxldCBpIGluIGFycmF5KSB7XG4gICAgICAgIGlmIChhcnJheS5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgaWYgKGFycmF5W2ldW2ZpZWxkXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbn1cblxuZXhwb3J0IGNsYXNzIFRlc3ROb2RlIGV4dGVuZHMgTm9kZSB7XG4gICAgcmVjb21waWxlOiBib29sZWFuO1xuICAgIHJ1bm5pbmc6IGJvb2xlYW47XG4gICAgcHJvdmlkZXI6IEFjY291bnQ7XG4gICAgemFwOiBBY2NvdW50O1xuICAgIG5vZGVvc19wYXRoOiBzdHJpbmc7XG4gICAgaW5zdGFuY2U6IGFueTtcbiAgICB1c2VyOiBBY2NvdW50O1xuICAgIHRva2VuOiBBY2NvdW50O1xuXG4gICAgY29uc3RydWN0b3IodmVyYm9zZTogYm9vbGVhbiwgcmVjb21waWxlOiBib29sZWFuLCBlbmRwb2ludDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIHZlcmJvc2U6IHZlcmJvc2UsXG4gICAgICAgICAgICBrZXlfcHJvdmlkZXI6IFtBQ0NfVEVTVF9QUklWX0tFWSwgQUNDX09XTkVSX1BSSVZfS0VZXSxcbiAgICAgICAgICAgIGh0dHBfZW5kcG9pbnQ6ICdodHRwOi8vMTI3LjAuMC4xOjg4ODgnLFxuICAgICAgICAgICAgY2hhaW5faWQ6ICcnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlY29tcGlsZSA9IHJlY29tcGlsZTtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICB0aGlzLm5vZGVvc19wYXRoID0gTk9ERU9TX1BBVEg7XG4gICAgICAgIHRoaXMucHJvdmlkZXIgPSBuZXcgQWNjb3VudCgnemFwLnByb3ZpZGVyJykudXNlUHJpdmF0ZUtleShBQ0NfT1dORVJfUFJJVl9LRVkpO1xuICAgICAgICB0aGlzLnphcCA9IHRoaXMuZ2V0WmFwQWNjb3VudCgpLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy51c2VyID0gbmV3IEFjY291bnQoJ3VzZXInKS51c2VQcml2YXRlS2V5KEFDQ19URVNUX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy50b2tlbiA9IG5ldyBBY2NvdW50KCd6YXAudG9rZW4nKS51c2VQcml2YXRlS2V5KEFDQ19PV05FUl9QUklWX0tFWSk7XG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXN0IEVPUyBub2RlIGlzIGFscmVhZHkgcnVubmluZy4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB1c2Ugc3Bhd24gZnVuY3Rpb24gYmVjYXVzZSBub2Rlb3MgaGFzIGluZmluaXR5IG91dHB1dFxuICAgICAgICB0aGlzLmluc3RhbmNlID0gc3Bhd24odGhpcy5ub2Rlb3NfcGF0aCwgWyctZSAtcCBlb3NpbycsICctLWRlbGV0ZS1hbGwtYmxvY2tzJywgJy0tcGx1Z2luIGVvc2lvOjpwcm9kdWNlcl9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omhpc3RvcnlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpjaGFpbl9hcGlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpoaXN0b3J5X2FwaV9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omh0dHBfcGx1Z2luJ10sIHtzaGVsbDogdHJ1ZX0pO1xuICAgICAgICAvLyB3YWl0IHVudGlsIG5vZGUgaXMgcnVubmluZ1xuXG4gICAgICAgIHdoaWxlICh0aGlzLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBhd2FpdCB3YWl0RXZlbnQodGhpcy5pbnN0YW5jZS5zdGRlcnIsICdkYXRhJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy52ZXJib3NlKSBjb25zb2xlLmxvZygnRW9zIG5vZGUgaXMgcnVubmluZy4nKVxuICAgIH1cblxuICAgIGtpbGwoKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLmtpbGwoKTtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy52ZXJib3NlKSBjb25zb2xlLmxvZygnRW9zIG5vZGUga2lsbGVkLicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcmVzdGFydCgpIHtcbiAgICAgICAgdGhpcy5raWxsKCk7XG4gICAgICAgIGF3YWl0IHRoaXMucnVuKCk7XG4gICAgfVxuXG5cbiAgICBhc3luYyBpbml0KCkge1xuXG4gICAgICAgIGlmICghdGhpcy5ydW5uaW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VvcyBub2RlIG11c3QgcnVubmluZyByZWNlaXZlciBzZXR1cCBpbml0aWFsIHN0YXRlLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW9zID0gYXdhaXQgdGhpcy5jb25uZWN0KCk7XG4gICAgICAgIGF3YWl0IHRoaXMucmVnaXN0ZXJBY2NvdW50cyhlb3MpO1xuICAgICAgICBhd2FpdCB0aGlzLmRlcGxveShlb3MpO1xuICAgICAgICBhd2FpdCB0aGlzLmlzc3VlVG9rZW5zKGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuZ3JhbnRQZXJtaXNzaW9ucyhlb3MpO1xuICAgIH1cblxuXG4gICAgYXN5bmMgcmVnaXN0ZXJBY2NvdW50cyhlb3M6IGFueSkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCB0aGlzLnByb3ZpZGVyLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy56YXAucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCB0aGlzLnRva2VuLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy51c2VyLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBhc3luYyBpc3N1ZVRva2Vucyhlb3M6IGFueSkge1xuICAgICAgICByZXR1cm4gYXdhaXQgbmV3IFRyYW5zYWN0aW9uKClcbiAgICAgICAgICAgIC5zZW5kZXIodGhpcy50b2tlbilcbiAgICAgICAgICAgIC5yZWNlaXZlcih0aGlzLnRva2VuKVxuICAgICAgICAgICAgLmFjdGlvbignaXNzdWUnKVxuICAgICAgICAgICAgLmRhdGEoe3RvOiB0aGlzLnVzZXIubmFtZSwgcXVhbnRpdHk6ICcxMDAwMDAwIFRTVCcsIG1lbW86ICcnfSlcbiAgICAgICAgICAgIC5leGVjdXRlKGVvcyk7XG4gICAgfVxuXG4gICAgYXN5bmMgZGVwbG95KGVvczogYW55KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IGFueSA9IFtdO1xuICAgICAgICBjb25zdCBkZXBsb3llciA9IG5ldyBEZXBsb3llcih7ZW9zOiBlb3MsIGNvbnRyYWN0X25hbWU6ICdtYWluJ30pO1xuICAgICAgICBkZXBsb3llci5mcm9tKHRoaXMuemFwKTtcbiAgICAgICAgZGVwbG95ZXIuYWJpKEJpbmFyaWVzLm1haW5BYmkpO1xuICAgICAgICBkZXBsb3llci53YXNtKEJpbmFyaWVzLm1haW5XYXNtKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IGRlcGxveWVyLmRlcGxveSgpKTtcblxuICAgICAgICBsZXQgY3JlYXRlVG9rZW5UcmFuc2FjdGlvbiA9IG5ldyBUcmFuc2FjdGlvbigpXG4gICAgICAgICAgICAuc2VuZGVyKHRoaXMudG9rZW4pXG4gICAgICAgICAgICAucmVjZWl2ZXIodGhpcy50b2tlbilcbiAgICAgICAgICAgIC5hY3Rpb24oJ2NyZWF0ZScpXG4gICAgICAgICAgICAuZGF0YSh7aXNzdWVyOiB0aGlzLnRva2VuLm5hbWUsIG1heGltdW1fc3VwcGx5OiAnMTAwMDAwMDAwMCBUU1QnfSk7XG5cbiAgICAgICAgcmVzdWx0cy5wdXNoKFxuICAgICAgICAgICAgYXdhaXQgbmV3IERlcGxveWVyKHtlb3M6IGVvcywgY29udHJhY3RfbmFtZTogJ2Vvc2lvLnRva2VuJ30pXG4gICAgICAgICAgICAgICAgLmZyb20odGhpcy50b2tlbilcbiAgICAgICAgICAgICAgICAuYWJpKEJpbmFyaWVzLnRva2VuQWJpKVxuICAgICAgICAgICAgICAgIC53YXNtKEJpbmFyaWVzLnRva2VuV2FzbSlcbiAgICAgICAgICAgICAgICAuYWZ0ZXJEZXBsb3koY3JlYXRlVG9rZW5UcmFuc2FjdGlvbilcbiAgICAgICAgICAgICAgICAuZGVwbG95KClcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICBhc3luYyBncmFudFBlcm1pc3Npb25zKGVvczogYW55KSB7XG4gICAgICAgIGxldCBuZXdQZXJtaXNzaW9uID0ge1xuICAgICAgICAgICAgcGVybWlzc2lvbjoge1xuICAgICAgICAgICAgICAgIGFjdG9yOiB0aGlzLnphcC5uYW1lLFxuICAgICAgICAgICAgICAgIHBlcm1pc3Npb246ICdlb3Npby5jb2RlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdlaWdodDogMVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCB1c2VyID0gYXdhaXQgZW9zLmdldEFjY291bnQodGhpcy51c2VyLm5hbWUpO1xuICAgICAgICBsZXQgbWFpbiA9IGF3YWl0IGVvcy5nZXRBY2NvdW50KHRoaXMuemFwLm5hbWUpO1xuXG4gICAgICAgIGxldCBuZXdVc2VyQXV0aCA9IHVzZXIucGVybWlzc2lvbnNbZmluZEVsZW1lbnQodXNlci5wZXJtaXNzaW9ucywgJ3Blcm1fbmFtZScsICdhY3RpdmUnKV07XG4gICAgICAgIG5ld1VzZXJBdXRoLnJlcXVpcmVkX2F1dGguYWNjb3VudHMucHVzaChuZXdQZXJtaXNzaW9uKTtcblxuICAgICAgICBsZXQgbmV3TWFpbkF1dGggPSBtYWluLnBlcm1pc3Npb25zW2ZpbmRFbGVtZW50KG1haW4ucGVybWlzc2lvbnMsICdwZXJtX25hbWUnLCAnYWN0aXZlJyldO1xuICAgICAgICBuZXdNYWluQXV0aC5yZXF1aXJlZF9hdXRoLmFjY291bnRzLnB1c2gobmV3UGVybWlzc2lvbik7XG5cbiAgICAgICAgYXdhaXQgZW9zLnRyYW5zYWN0aW9uKCh0cjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgdHIudXBkYXRlYXV0aCh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IHVzZXIuYWNjb3VudF9uYW1lLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiAnb3duZXInLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiBuZXdVc2VyQXV0aC5yZXF1aXJlZF9hdXRoXG4gICAgICAgICAgICAgICAgfSwge2F1dGhvcml6YXRpb246IGAke3VzZXIuYWNjb3VudF9uYW1lfUBvd25lcmB9KTtcblxuICAgICAgICAgICAgICAgIHRyLnVwZGF0ZWF1dGgoe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiBtYWluLmFjY291bnRfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbjogJ2FjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogJ293bmVyJyxcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogbmV3TWFpbkF1dGgucmVxdWlyZWRfYXV0aFxuICAgICAgICAgICAgICAgIH0sIHthdXRob3JpemF0aW9uOiBgJHttYWluLmFjY291bnRfbmFtZX1Ab3duZXJgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZ2V0UHJvdmlkZXJBY2NvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm92aWRlcjtcbiAgICB9XG5cbiAgICBnZXRVc2VyQWNjb3VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXNlcjtcbiAgICB9XG59XG4iXX0=