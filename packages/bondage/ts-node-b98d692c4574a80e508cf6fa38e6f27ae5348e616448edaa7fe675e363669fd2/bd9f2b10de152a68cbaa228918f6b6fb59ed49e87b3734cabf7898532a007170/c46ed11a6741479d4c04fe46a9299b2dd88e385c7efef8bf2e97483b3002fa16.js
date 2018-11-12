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
    getTokenAccount() {
        return this.token;
    }
}
exports.TestNode = TestNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L2Vudmlyb25tZW50LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL2JvbmRhZ2Uvc3JjL3Rlc3QvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsZ0RBQTRHO0FBQzVHLGlEQUE4QztBQUU5QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUdsRCxzREFBK0M7QUFHL0MsMkJBQTJCO0FBQzNCLE1BQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDO0FBQzVDLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQ2pDLE1BQU0saUJBQWlCLEdBQUcscURBQXFELENBQUM7QUFDaEYsTUFBTSxrQkFBa0IsR0FBRyxxREFBcUQsQ0FBQztBQUdqRixtQkFBbUIsS0FBc0IsRUFBRSxJQUFZO0lBQ25ELE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtRQUN4QyxrQkFBa0IsSUFBUztZQUN2QixLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQztRQUVELEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELHFCQUFxQixLQUFpQixFQUFFLEtBQWEsRUFBRSxLQUFVO0lBQzdELEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFO1FBQ2pCLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN6QixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLEVBQUU7Z0JBQzNCLE9BQU8sQ0FBQyxDQUFDO2FBQ1o7U0FDSjtLQUNKO0lBRUQsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNkLENBQUM7QUFFRCxjQUFzQixTQUFRLGdCQUFJO0lBVTlCLFlBQVksT0FBZ0IsRUFBRSxTQUFrQixFQUFFLFFBQWdCO1FBQzlELEtBQUssQ0FBQztZQUNGLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLGtCQUFrQixDQUFDO1lBQ3JELGFBQWEsRUFBRSx1QkFBdUI7WUFDdEMsUUFBUSxFQUFFLEVBQUU7U0FDZixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksbUJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksbUJBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRUssR0FBRzs7WUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO2FBQ3hEO1lBQ0Qsd0RBQXdEO1lBQ3hELElBQUksQ0FBQyxRQUFRLEdBQUcscUJBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsYUFBYSxFQUFFLHFCQUFxQixFQUFFLGlDQUFpQyxFQUFFLGdDQUFnQyxFQUFFLGtDQUFrQyxFQUFFLG9DQUFvQyxFQUFFLDZCQUE2QixDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMvUSw2QkFBNkI7WUFFN0IsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUssRUFBRTtnQkFDM0IsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzlDLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxLQUFLLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2lCQUN2QjthQUNKO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTztnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUE7UUFDekQsQ0FBQztLQUFBO0lBRUQsSUFBSTtRQUNBLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTztnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDckQ7SUFDTCxDQUFDO0lBRUssT0FBTzs7WUFDVCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO0tBQUE7SUFHSyxJQUFJOztZQUVOLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELENBQUMsQ0FBQzthQUMxRTtZQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBR0ssZ0JBQWdCLENBQUMsR0FBUTs7WUFDM0IsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7S0FBQTtJQUVLLFdBQVcsQ0FBQyxHQUFROztZQUN0QixPQUFPLE1BQU0sSUFBSSx1QkFBVyxFQUFFO2lCQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7aUJBQ3BCLE1BQU0sQ0FBQyxPQUFPLENBQUM7aUJBQ2YsSUFBSSxDQUFDLEVBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQyxDQUFDO2lCQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQztLQUFBO0lBRUssTUFBTSxDQUFDLEdBQVE7O1lBQ2pCLE1BQU0sT0FBTyxHQUFRLEVBQUUsQ0FBQztZQUN4QixNQUFNLFFBQVEsR0FBRyxJQUFJLG9CQUFRLENBQUMsRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1lBQ2pFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvQixRQUFRLENBQUMsSUFBSSxDQUFDLHVCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLElBQUksc0JBQXNCLEdBQUcsSUFBSSx1QkFBVyxFQUFFO2lCQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7aUJBQ3BCLE1BQU0sQ0FBQyxRQUFRLENBQUM7aUJBQ2hCLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDO1lBRXZFLE9BQU8sQ0FBQyxJQUFJLENBQ1IsTUFBTSxJQUFJLG9CQUFRLENBQUMsRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUMsQ0FBQztpQkFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7aUJBQ2hCLEdBQUcsQ0FBQyx1QkFBUSxDQUFDLFFBQVEsQ0FBQztpQkFDdEIsSUFBSSxDQUFDLHVCQUFRLENBQUMsU0FBUyxDQUFDO2lCQUN4QixXQUFXLENBQUMsc0JBQXNCLENBQUM7aUJBQ25DLE1BQU0sRUFBRSxDQUNoQixDQUFDO1lBRUYsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQztLQUFBO0lBRUssZ0JBQWdCLENBQUMsR0FBUTs7WUFDM0IsSUFBSSxhQUFhLEdBQUc7Z0JBQ2hCLFVBQVUsRUFBRTtvQkFDUixLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJO29CQUNwQixVQUFVLEVBQUUsWUFBWTtpQkFDM0I7Z0JBQ0QsTUFBTSxFQUFFLENBQUM7YUFDWixDQUFDO1lBRUYsSUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsSUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFL0MsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN6RixXQUFXLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFdkQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN6RixXQUFXLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFdkQsTUFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBTyxFQUFFLEVBQUU7Z0JBQzFCLEVBQUUsQ0FBQyxVQUFVLENBQUM7b0JBQ1YsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMxQixVQUFVLEVBQUUsUUFBUTtvQkFDcEIsTUFBTSxFQUFFLE9BQU87b0JBQ2YsSUFBSSxFQUFFLFdBQVcsQ0FBQyxhQUFhO2lCQUNsQyxFQUFFLEVBQUMsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksUUFBUSxFQUFDLENBQUMsQ0FBQztnQkFFbEQsRUFBRSxDQUFDLFVBQVUsQ0FBQztvQkFDVixPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7b0JBQzFCLFVBQVUsRUFBRSxRQUFRO29CQUNwQixNQUFNLEVBQUUsT0FBTztvQkFDZixJQUFJLEVBQUUsV0FBVyxDQUFDLGFBQWE7aUJBQ2xDLEVBQUUsRUFBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ3RELENBQUMsQ0FDSixDQUFDO1FBQ04sQ0FBQztLQUFBO0lBRUQsa0JBQWtCO1FBQ2QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxjQUFjO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFDRCxlQUFlO1FBQ1gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7Q0FDSjtBQXBLRCw0QkFvS0MiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHtBY2NvdW50LCBOb2RlLCBEZXBsb3llciwgVHJhbnNhY3Rpb24sIFNpbXBsZUV2ZW50TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcn0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQge3NwYXduLCBleGVjU3luY30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IFBST0pFQ1RfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUgKyAnLy4uJyk7XG5pbXBvcnQgKiBhcyBzdHJlYW0gZnJvbSBcInN0cmVhbVwiO1xuXG5pbXBvcnQgeyBCaW5hcmllcyB9IGZyb20gXCJAemFwanMvZW9zLWJpbmFyaWVzXCI7XG5cblxuLy9UT0RPOiByZWNlaXZlIGR5bmFtaWNhbGx5XG5jb25zdCBOT0RFT1NfUEFUSCA9ICcvdXNyL2xvY2FsL2Jpbi9ub2Rlb3MnO1xuY29uc3QgRU9TX0RJUiA9ICcvaG9tZS91c2VyL2Vvcyc7XG5jb25zdCBBQ0NfVEVTVF9QUklWX0tFWSA9ICc1S1F3clBid2RMNlBoWHVqeFczN0ZTU1FaMUppd3NTVDRjcVF6RGV5WHRQNzl6a3ZGRDMnO1xuY29uc3QgQUNDX09XTkVSX1BSSVZfS0VZID0gJzVLUXdyUGJ3ZEw2UGhYdWp4VzM3RlNTUVoxSml3c1NUNGNxUXpEZXlYdFA3OXprdkZEMyc7XG5cblxuZnVuY3Rpb24gd2FpdEV2ZW50KGV2ZW50OiBzdHJlYW0uUmVhZGFibGUsIHR5cGU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKGRhdGE6IGFueSkge1xuICAgICAgICAgICAgZXZlbnQucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50Lm9uKHR5cGUsIGxpc3RlbmVyKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZmluZEVsZW1lbnQoYXJyYXk6IEFycmF5PGFueT4sIGZpZWxkOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICBmb3IgKGxldCBpIGluIGFycmF5KSB7XG4gICAgICAgIGlmIChhcnJheS5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgaWYgKGFycmF5W2ldW2ZpZWxkXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbn1cblxuZXhwb3J0IGNsYXNzIFRlc3ROb2RlIGV4dGVuZHMgTm9kZSB7XG4gICAgcmVjb21waWxlOiBib29sZWFuO1xuICAgIHJ1bm5pbmc6IGJvb2xlYW47XG4gICAgcHJvdmlkZXI6IEFjY291bnQ7XG4gICAgemFwOiBBY2NvdW50O1xuICAgIG5vZGVvc19wYXRoOiBzdHJpbmc7XG4gICAgaW5zdGFuY2U6IGFueTtcbiAgICB1c2VyOiBBY2NvdW50O1xuICAgIHRva2VuOiBBY2NvdW50O1xuXG4gICAgY29uc3RydWN0b3IodmVyYm9zZTogYm9vbGVhbiwgcmVjb21waWxlOiBib29sZWFuLCBlbmRwb2ludDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIHZlcmJvc2U6IHZlcmJvc2UsXG4gICAgICAgICAgICBrZXlfcHJvdmlkZXI6IFtBQ0NfVEVTVF9QUklWX0tFWSwgQUNDX09XTkVSX1BSSVZfS0VZXSxcbiAgICAgICAgICAgIGh0dHBfZW5kcG9pbnQ6ICdodHRwOi8vMTI3LjAuMC4xOjg4ODgnLFxuICAgICAgICAgICAgY2hhaW5faWQ6ICcnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlY29tcGlsZSA9IHJlY29tcGlsZTtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICB0aGlzLm5vZGVvc19wYXRoID0gTk9ERU9TX1BBVEg7XG4gICAgICAgIHRoaXMucHJvdmlkZXIgPSBuZXcgQWNjb3VudCgnemFwLnByb3ZpZGVyJykudXNlUHJpdmF0ZUtleShBQ0NfT1dORVJfUFJJVl9LRVkpO1xuICAgICAgICB0aGlzLnphcCA9IHRoaXMuZ2V0WmFwQWNjb3VudCgpLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy51c2VyID0gbmV3IEFjY291bnQoJ3VzZXInKS51c2VQcml2YXRlS2V5KEFDQ19URVNUX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy50b2tlbiA9IG5ldyBBY2NvdW50KCd6YXAudG9rZW4nKS51c2VQcml2YXRlS2V5KEFDQ19PV05FUl9QUklWX0tFWSk7XG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZXN0IEVPUyBub2RlIGlzIGFscmVhZHkgcnVubmluZy4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB1c2Ugc3Bhd24gZnVuY3Rpb24gYmVjYXVzZSBub2Rlb3MgaGFzIGluZmluaXR5IG91dHB1dFxuICAgICAgICB0aGlzLmluc3RhbmNlID0gc3Bhd24odGhpcy5ub2Rlb3NfcGF0aCwgWyctZSAtcCBlb3NpbycsICctLWRlbGV0ZS1hbGwtYmxvY2tzJywgJy0tcGx1Z2luIGVvc2lvOjpwcm9kdWNlcl9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omhpc3RvcnlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpjaGFpbl9hcGlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpoaXN0b3J5X2FwaV9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omh0dHBfcGx1Z2luJ10sIHsgc2hlbGw6IHRydWUgfSk7XG4gICAgICAgIC8vIHdhaXQgdW50aWwgbm9kZSBpcyBydW5uaW5nXG5cbiAgICAgICAgd2hpbGUgKHRoaXMucnVubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGF3YWl0IHdhaXRFdmVudCh0aGlzLmluc3RhbmNlLnN0ZGVyciwgJ2RhdGEnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnZlcmJvc2UpIGNvbnNvbGUubG9nKCdFb3Mgbm9kZSBpcyBydW5uaW5nLicpXG4gICAgfVxuXG4gICAga2lsbCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2Uua2lsbCgpO1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLnZlcmJvc2UpIGNvbnNvbGUubG9nKCdFb3Mgbm9kZSBraWxsZWQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyByZXN0YXJ0KCkge1xuICAgICAgICB0aGlzLmtpbGwoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5ydW4oKTtcbiAgICB9XG5cblxuICAgIGFzeW5jIGluaXQoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW9zIG5vZGUgbXVzdCBydW5uaW5nIHJlY2VpdmVyIHNldHVwIGluaXRpYWwgc3RhdGUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWdpc3RlckFjY291bnRzKGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuZGVwbG95KGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuaXNzdWVUb2tlbnMoZW9zKTtcbiAgICAgICAgYXdhaXQgdGhpcy5ncmFudFBlcm1pc3Npb25zKGVvcyk7XG4gICAgfVxuXG5cbiAgICBhc3luYyByZWdpc3RlckFjY291bnRzKGVvczogYW55KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMucHJvdmlkZXIucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCB0aGlzLnphcC5yZWdpc3Rlcihlb3MpKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMudG9rZW4ucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCB0aGlzLnVzZXIucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFzeW5jIGlzc3VlVG9rZW5zKGVvczogYW55KSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBuZXcgVHJhbnNhY3Rpb24oKVxuICAgICAgICAgICAgLnNlbmRlcih0aGlzLnRva2VuKVxuICAgICAgICAgICAgLnJlY2VpdmVyKHRoaXMudG9rZW4pXG4gICAgICAgICAgICAuYWN0aW9uKCdpc3N1ZScpXG4gICAgICAgICAgICAuZGF0YSh7dG86IHRoaXMudXNlci5uYW1lLCBxdWFudGl0eTogJzEwMDAwMDAgVFNUJywgbWVtbzogJyd9KVxuICAgICAgICAgICAgLmV4ZWN1dGUoZW9zKTtcbiAgICB9XG5cbiAgICBhc3luYyBkZXBsb3koZW9zOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XG4gICAgICAgIGNvbnN0IGRlcGxveWVyID0gbmV3IERlcGxveWVyKHtlb3M6IGVvcywgY29udHJhY3RfbmFtZTogJ21haW4nfSk7XG4gICAgICAgIGRlcGxveWVyLmZyb20odGhpcy56YXApO1xuICAgICAgICBkZXBsb3llci5hYmkoQmluYXJpZXMubWFpbkFiaSk7XG4gICAgICAgIGRlcGxveWVyLndhc20oQmluYXJpZXMubWFpbldhc20pO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgZGVwbG95ZXIuZGVwbG95KCkpO1xuXG4gICAgICAgIGxldCBjcmVhdGVUb2tlblRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKClcbiAgICAgICAgICAgIC5zZW5kZXIodGhpcy50b2tlbilcbiAgICAgICAgICAgIC5yZWNlaXZlcih0aGlzLnRva2VuKVxuICAgICAgICAgICAgLmFjdGlvbignY3JlYXRlJylcbiAgICAgICAgICAgIC5kYXRhKHtpc3N1ZXI6IHRoaXMudG9rZW4ubmFtZSwgbWF4aW11bV9zdXBwbHk6ICcxMDAwMDAwMDAwIFRTVCd9KTtcblxuICAgICAgICByZXN1bHRzLnB1c2goXG4gICAgICAgICAgICBhd2FpdCBuZXcgRGVwbG95ZXIoe2VvczogZW9zLCBjb250cmFjdF9uYW1lOiAnZW9zaW8udG9rZW4nfSlcbiAgICAgICAgICAgICAgICAuZnJvbSh0aGlzLnRva2VuKVxuICAgICAgICAgICAgICAgIC5hYmkoQmluYXJpZXMudG9rZW5BYmkpXG4gICAgICAgICAgICAgICAgLndhc20oQmluYXJpZXMudG9rZW5XYXNtKVxuICAgICAgICAgICAgICAgIC5hZnRlckRlcGxveShjcmVhdGVUb2tlblRyYW5zYWN0aW9uKVxuICAgICAgICAgICAgICAgIC5kZXBsb3koKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFzeW5jIGdyYW50UGVybWlzc2lvbnMoZW9zOiBhbnkpIHtcbiAgICAgICAgbGV0IG5ld1Blcm1pc3Npb24gPSB7XG4gICAgICAgICAgICBwZXJtaXNzaW9uOiB7XG4gICAgICAgICAgICAgICAgYWN0b3I6IHRoaXMuemFwLm5hbWUsXG4gICAgICAgICAgICAgICAgcGVybWlzc2lvbjogJ2Vvc2lvLmNvZGUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2VpZ2h0OiAxXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHVzZXIgPSBhd2FpdCBlb3MuZ2V0QWNjb3VudCh0aGlzLnVzZXIubmFtZSk7XG4gICAgICAgIGxldCBtYWluID0gYXdhaXQgZW9zLmdldEFjY291bnQodGhpcy56YXAubmFtZSk7XG5cbiAgICAgICAgbGV0IG5ld1VzZXJBdXRoID0gdXNlci5wZXJtaXNzaW9uc1tmaW5kRWxlbWVudCh1c2VyLnBlcm1pc3Npb25zLCAncGVybV9uYW1lJywgJ2FjdGl2ZScpXTtcbiAgICAgICAgbmV3VXNlckF1dGgucmVxdWlyZWRfYXV0aC5hY2NvdW50cy5wdXNoKG5ld1Blcm1pc3Npb24pO1xuXG4gICAgICAgIGxldCBuZXdNYWluQXV0aCA9IG1haW4ucGVybWlzc2lvbnNbZmluZEVsZW1lbnQobWFpbi5wZXJtaXNzaW9ucywgJ3Blcm1fbmFtZScsICdhY3RpdmUnKV07XG4gICAgICAgIG5ld01haW5BdXRoLnJlcXVpcmVkX2F1dGguYWNjb3VudHMucHVzaChuZXdQZXJtaXNzaW9uKTtcblxuICAgICAgICBhd2FpdCBlb3MudHJhbnNhY3Rpb24oKHRyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB0ci51cGRhdGVhdXRoKHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogdXNlci5hY2NvdW50X25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb246ICdhY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdvd25lcicsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IG5ld1VzZXJBdXRoLnJlcXVpcmVkX2F1dGhcbiAgICAgICAgICAgICAgICB9LCB7YXV0aG9yaXphdGlvbjogYCR7dXNlci5hY2NvdW50X25hbWV9QG93bmVyYH0pO1xuXG4gICAgICAgICAgICAgICAgdHIudXBkYXRlYXV0aCh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG1haW4uYWNjb3VudF9uYW1lLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiAnb3duZXInLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiBuZXdNYWluQXV0aC5yZXF1aXJlZF9hdXRoXG4gICAgICAgICAgICAgICAgfSwge2F1dGhvcml6YXRpb246IGAke21haW4uYWNjb3VudF9uYW1lfUBvd25lcmB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXRQcm92aWRlckFjY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3ZpZGVyO1xuICAgIH1cblxuICAgIGdldFVzZXJBY2NvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy51c2VyO1xuICAgIH1cbiAgICBnZXRUb2tlbkFjY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRva2VuO1xuICAgIH1cbn1cbiJdfQ==