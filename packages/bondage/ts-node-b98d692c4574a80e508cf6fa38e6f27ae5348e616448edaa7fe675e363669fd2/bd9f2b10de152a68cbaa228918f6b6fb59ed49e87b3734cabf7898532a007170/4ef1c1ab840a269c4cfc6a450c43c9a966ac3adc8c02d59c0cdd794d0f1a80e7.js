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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy90ZXN0L2Vudmlyb25tZW50LnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL2JvbmRhZ2Uvc3JjL3Rlc3QvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsZ0RBQThHO0FBQzlHLGlEQUFnRDtBQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNsRCxzREFBK0M7QUFJL0MsMkJBQTJCO0FBQzNCLE1BQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDO0FBQzVDLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQ2pDLE1BQU0sU0FBUyxHQUFHLE9BQU8sR0FBRyw4QkFBOEIsQ0FBQztBQUMzRCxNQUFNLGlCQUFpQixHQUFHLHFEQUFxRCxDQUFDO0FBQ2hGLE1BQU0sa0JBQWtCLEdBQUcscURBQXFELENBQUM7QUFJakYsbUJBQW1CLEtBQXNCLEVBQUUsSUFBWTtJQUNuRCxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU07UUFDdkMsa0JBQWtCLElBQVM7WUFDdkIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFDRCxxQkFBcUIsS0FBaUIsRUFBRSxLQUFhLEVBQUUsS0FBYTtJQUNoRSxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRTtRQUNqQixJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDekIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxFQUFFO2dCQUMzQixPQUFPLENBQUMsQ0FBQzthQUNaO1NBQ0o7S0FDSjtJQUVELE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDZCxDQUFDO0FBQ0QsY0FBc0IsU0FBUSxnQkFBSTtJQVU5QixZQUFZLE9BQWdCLEVBQUUsU0FBa0IsRUFBRSxRQUFnQjtRQUM5RCxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLGtCQUFrQixDQUFDLEVBQUUsYUFBYSxFQUFFLHVCQUF1QixFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZJLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxtQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxtQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLG1CQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRTNELENBQUM7SUFDRCxXQUFXO1FBQ1AsT0FBTztZQUNILFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtZQUMvQixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1lBQ3ZDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNqQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7U0FDaEIsQ0FBQztJQUNOLENBQUM7SUFFSyxHQUFHOztZQUNMLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7YUFDeEQ7WUFDRCx3REFBd0Q7WUFDMUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxxQkFBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxhQUFhLEVBQUUscUJBQXFCLEVBQUUsaUNBQWlDLEVBQUUsZ0NBQWdDLEVBQUUsa0NBQWtDLEVBQUUsb0NBQW9DLEVBQUUsNkJBQTZCLENBQUMsRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBQzdRLDJFQUEyRTtZQUV6RSw2QkFBNkI7WUFFN0IsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUssRUFBRTtnQkFDM0IsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzFDLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxLQUFLLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2lCQUN2QjthQUNSO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTztnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUE7UUFDekQsQ0FBQztLQUFBO0lBRUQsSUFBSTtRQUNBLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTztnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDekQ7SUFDTCxDQUFDO0lBRU0sT0FBTzs7WUFDVCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO0tBQUE7SUFHSSxJQUFJOztZQUVOLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELENBQUMsQ0FBQzthQUMxRTtZQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakMsT0FBTyxHQUFHLENBQUM7UUFDZixDQUFDO0tBQUE7SUFHSyxnQkFBZ0IsQ0FBQyxHQUFROztZQUMzQixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0MsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckQsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwRCxPQUFPLE9BQU8sQ0FBQztRQUNuQixDQUFDO0tBQUE7SUFFSyxNQUFNLENBQUMsR0FBUTs7WUFDakIsTUFBTSxPQUFPLEdBQVEsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sUUFBUSxHQUFHLElBQUksb0JBQVEsQ0FBQyxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7WUFDakUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9CLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDdEMsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQztLQUFBO0lBQ0ssV0FBVyxDQUFDLEdBQVE7O1lBQ3RCLE1BQU0sT0FBTyxHQUFRLEVBQUUsQ0FBQztZQUN4QixNQUFNLFFBQVEsR0FBRyxJQUFJLG9CQUFRLENBQUMsRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUMsQ0FBQyxDQUFDO1lBQ3hFLElBQUksc0JBQXNCLEdBQUcsSUFBSSx1QkFBVyxFQUFFO2lCQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztpQkFDMUIsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7aUJBQzVCLE1BQU0sQ0FBQyxRQUFRLENBQUM7aUJBQ2hCLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDO1lBQy9FLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2xDLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoQyxRQUFRLENBQUMsSUFBSSxDQUFDLHVCQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUMxQyxDQUFDO0tBQUE7SUFDSyxnQkFBZ0IsQ0FBQyxHQUFROztZQUMzQixJQUFJLGFBQWEsR0FBRztnQkFDaEIsVUFBVSxFQUFFO29CQUNSLEtBQUssRUFBRSxVQUFVO29CQUNqQixVQUFVLEVBQUUsWUFBWTtpQkFDM0I7Z0JBQ0QsTUFBTSxFQUFFLENBQUM7YUFDWixDQUFDO1lBRUYsSUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEQsSUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFL0MsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN6RixXQUFXLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFdkQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN6RixXQUFXLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFdkQsTUFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBTyxFQUFFLEVBQUU7Z0JBQzVCLEVBQUUsQ0FBQyxVQUFVLENBQUM7b0JBQ1YsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMxQixVQUFVLEVBQUUsUUFBUTtvQkFDcEIsTUFBTSxFQUFFLE9BQU87b0JBQ2YsSUFBSSxFQUFFLFdBQVcsQ0FBQyxhQUFhO2lCQUNsQyxFQUFFLEVBQUMsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksUUFBUSxFQUFDLENBQUMsQ0FBQztnQkFHbkQsRUFBRSxDQUFDLFVBQVUsQ0FBQztvQkFDVCxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7b0JBQzFCLFVBQVUsRUFBRSxRQUFRO29CQUNwQixNQUFNLEVBQUUsT0FBTztvQkFDZixJQUFJLEVBQUUsV0FBVyxDQUFDLGFBQWE7aUJBQ2xDLEVBQUUsRUFBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0NBQ0o7QUF4SkQsNEJBd0pDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCB7IEFjY291bnQsIE5vZGUsIERlcGxveWVyLCBUcmFuc2FjdGlvbiwgU2ltcGxlRXZlbnRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyIH0gZnJvbSAnQHphcGpzL2Vvcy11dGlscyc7XG5pbXBvcnQgeyBzcGF3biwgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmNvbnN0IFBST0pFQ1RfUEFUSCA9IHBhdGguam9pbihfX2Rpcm5hbWUgKyAnLy4uJyk7XG5pbXBvcnQgeyBCaW5hcmllcyB9IGZyb20gXCJAemFwanMvZW9zLWJpbmFyaWVzXCI7XG5pbXBvcnQgKiBhcyBzdHJlYW0gZnJvbSBcInN0cmVhbVwiO1xuXG5cbi8vVE9ETzogcmVjZWl2ZSBkeW5hbWljYWxseVxuY29uc3QgTk9ERU9TX1BBVEggPSAnL3Vzci9sb2NhbC9iaW4vbm9kZW9zJztcbmNvbnN0IEVPU19ESVIgPSAnL2hvbWUvdXNlci9lb3MnO1xuY29uc3QgVE9LRU5fRElSID0gRU9TX0RJUiArICcvYnVpbGQvY29udHJhY3RzL2Vvc2lvLnRva2VuJztcbmNvbnN0IEFDQ19URVNUX1BSSVZfS0VZID0gJzVLZkZ1Zm5VVGhhRWVxc1NlTVB0MjdQb2FuNWc4TFVhRW9yc0MxaEhtMUZnTkpmcjNzWCc7XG5jb25zdCBBQ0NfT1dORVJfUFJJVl9LRVkgPSAnNUtRd3JQYndkTDZQaFh1anhXMzdGU1NRWjFKaXdzU1Q0Y3FRekRleVh0UDc5emt2RkQzJztcblxuXG5cbmZ1bmN0aW9uIHdhaXRFdmVudChldmVudDogc3RyZWFtLlJlYWRhYmxlLCB0eXBlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKGRhdGE6IGFueSkge1xuICAgICAgICAgICAgZXZlbnQucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50Lm9uKHR5cGUsIGxpc3RlbmVyKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGZpbmRFbGVtZW50KGFycmF5OiBBcnJheTxhbnk+LCBmaWVsZDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgZm9yIChsZXQgaSBpbiBhcnJheSkge1xuICAgICAgICBpZiAoYXJyYXkuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIGlmIChhcnJheVtpXVtmaWVsZF0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG59XG5leHBvcnQgY2xhc3MgVGVzdE5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICByZWNvbXBpbGU6IGJvb2xlYW47XG4gICAgcnVubmluZzogYm9vbGVhbjtcbiAgICB6YXA6IEFjY291bnQ7XG4gICAgbm9kZW9zX3BhdGg6IHN0cmluZztcbiAgICBpbnN0YW5jZTogYW55O1xuICAgIGFjY291bnRfdXNlcjogQWNjb3VudDtcbiAgICBhY2NvdW50X3Rva2VuOiBBY2NvdW50O1xuICAgIGFjY291bnRfcHJvdmlkZXI6IEFjY291bnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcih2ZXJib3NlOiBib29sZWFuLCByZWNvbXBpbGU6IGJvb2xlYW4sIGVuZHBvaW50OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoe3ZlcmJvc2U6IHZlcmJvc2UsIGtleV9wcm92aWRlcjogW0FDQ19URVNUX1BSSVZfS0VZLCBBQ0NfT1dORVJfUFJJVl9LRVldLCBodHRwX2VuZHBvaW50OiAnaHR0cDovLzEyNy4wLjAuMTo4ODg4JywgY2hhaW5faWQ6ICcnfSk7XG4gICAgICAgIHRoaXMucmVjb21waWxlID0gcmVjb21waWxlO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XG4gICAgICAgIHRoaXMubm9kZW9zX3BhdGggPSBOT0RFT1NfUEFUSDtcbiAgICAgICAgdGhpcy56YXAgPSB0aGlzLmdldFphcEFjY291bnQoKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3VzZXIgPSBuZXcgQWNjb3VudCgndXNlcicpO1xuICAgICAgICB0aGlzLmFjY291bnRfdG9rZW4gPSBuZXcgQWNjb3VudCgnemFwLnRva2VuJyk7XG4gICAgICAgIHRoaXMuYWNjb3VudF9wcm92aWRlciA9IG5ldyBBY2NvdW50KCd6YXAucHJvdmlkZXInKTtcbiAgICAgICAgdGhpcy56YXAudXNlUHJpdmF0ZUtleShBQ0NfT1dORVJfUFJJVl9LRVkpO1xuICAgICAgICB0aGlzLmFjY291bnRfdXNlci51c2VQcml2YXRlS2V5KEFDQ19URVNUX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3Rva2VuLnVzZVByaXZhdGVLZXkoQUNDX09XTkVSX1BSSVZfS0VZKTtcbiAgICAgICAgdGhpcy5hY2NvdW50X3Byb3ZpZGVyLnVzZVByaXZhdGVLZXkoQUNDX1RFU1RfUFJJVl9LRVkpO1xuXG4gICAgfVxuICAgIGdldEFjY291bnRzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjb3VudF91c2VyOiB0aGlzLmFjY291bnRfdXNlcixcbiAgICAgICAgICAgIGFjY291bnRfcHJvdmlkZXI6IHRoaXMuYWNjb3VudF9wcm92aWRlcixcbiAgICAgICAgICAgIGFjY291bnRfdG9rZW46IHRoaXMuYWNjb3VudF90b2tlbixcbiAgICAgICAgICAgIHphcDogdGhpcy56YXBcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYyBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rlc3QgRU9TIG5vZGUgaXMgYWxyZWFkeSBydW5uaW5nLicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHVzZSBzcGF3biBmdW5jdGlvbiBiZWNhdXNlIG5vZGVvcyBoYXMgaW5maW5pdHkgb3V0cHV0XG4gICAgICB0aGlzLmluc3RhbmNlID0gc3Bhd24odGhpcy5ub2Rlb3NfcGF0aCwgWyctZSAtcCBlb3NpbycsICctLWRlbGV0ZS1hbGwtYmxvY2tzJywgJy0tcGx1Z2luIGVvc2lvOjpwcm9kdWNlcl9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omhpc3RvcnlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpjaGFpbl9hcGlfcGx1Z2luJywgJy0tcGx1Z2luIGVvc2lvOjpoaXN0b3J5X2FwaV9wbHVnaW4nLCAnLS1wbHVnaW4gZW9zaW86Omh0dHBfcGx1Z2luJ10sIHtzaGVsbDogdHJ1ZX0pO1xuICAgICAgLy90aGlzLmluc3RhbmNlID0gc3Bhd24oJ2RvY2tlcicsIFsncnVuJywgJ2Vvc2lvJywgJy0tZGVsZXRlLWFsbC1ibG9ja3MnXSk7XG5cbiAgICAgICAgLy8gd2FpdCB1bnRpbCBub2RlIGlzIHJ1bm5pbmdcblxuICAgICAgICB3aGlsZSAodGhpcy5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYXdhaXQgd2FpdEV2ZW50KHRoaXMuaW5zdGFuY2Uuc3RkZXJyLCAnZGF0YScpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudmVyYm9zZSkgY29uc29sZS5sb2coJ0VvcyBub2RlIGlzIHJ1bm5pbmcuJylcbiAgICB9XG5cbiAgICBraWxsKCkge1xuICAgICAgICBpZiAodGhpcy5pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZS5raWxsKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmVyYm9zZSkgY29uc29sZS5sb2coJ0VvcyBub2RlIGtpbGxlZC4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICBhc3luYyByZXN0YXJ0KCkge1xuICAgICAgICAgdGhpcy5raWxsKCk7XG4gICAgICAgICBhd2FpdCB0aGlzLnJ1bigpO1xuICAgICB9XG5cblxuICAgIGFzeW5jIGluaXQoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW9zIG5vZGUgbXVzdCBydW5uaW5nIHJlY2VpdmVyIHNldHVwIGluaXRpYWwgc3RhdGUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWdpc3RlckFjY291bnRzKGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuZGVwbG95KGVvcyk7XG4gICAgICAgIGF3YWl0IHRoaXMuZGVwbG95VG9rZW4oZW9zKTtcbiAgICAgICAgYXdhaXQgdGhpcy5ncmFudFBlcm1pc3Npb25zKGVvcyk7XG4gICAgICAgIHJldHVybiBlb3M7XG4gICAgfVxuXG5cbiAgICBhc3luYyByZWdpc3RlckFjY291bnRzKGVvczogYW55KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHRoaXMuemFwLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy5hY2NvdW50X3Rva2VuLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy5hY2NvdW50X3Byb3ZpZGVyLnJlZ2lzdGVyKGVvcykpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgdGhpcy5hY2NvdW50X3VzZXIucmVnaXN0ZXIoZW9zKSk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIGFzeW5jIGRlcGxveShlb3M6IGFueSkge1xuICAgICAgICBjb25zdCByZXN1bHRzOiBhbnkgPSBbXTtcbiAgICAgICAgY29uc3QgZGVwbG95ZXIgPSBuZXcgRGVwbG95ZXIoe2VvczogZW9zLCBjb250cmFjdF9uYW1lOiAnbWFpbid9KTtcbiAgICAgICAgZGVwbG95ZXIuZnJvbSh0aGlzLnphcCk7XG4gICAgICAgIGRlcGxveWVyLmFiaShCaW5hcmllcy5tYWluQWJpKTtcbiAgICAgICAgZGVwbG95ZXIud2FzbShCaW5hcmllcy5tYWluV2FzbSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhd2FpdCBkZXBsb3llci5kZXBsb3koKSk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgICBhc3luYyBkZXBsb3lUb2tlbihlb3M6IGFueSkge1xuICAgICAgICBjb25zdCByZXN1bHRzOiBhbnkgPSBbXTtcbiAgICAgICAgY29uc3QgZGVwbG95ZXIgPSBuZXcgRGVwbG95ZXIoe2VvczogZW9zLCBjb250cmFjdF9uYW1lOiAnZW9zaW8udG9rZW4nfSk7XG4gICAgICAgIGxldCBjcmVhdGVUb2tlblRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKClcbiAgICAgICAgICAgIC5zZW5kZXIodGhpcy5hY2NvdW50X3Rva2VuKVxuICAgICAgICAgICAgLnJlY2VpdmVyKHRoaXMuYWNjb3VudF90b2tlbilcbiAgICAgICAgICAgIC5hY3Rpb24oJ2NyZWF0ZScpXG4gICAgICAgICAgICAuZGF0YSh7aXNzdWVyOiB0aGlzLmFjY291bnRfdG9rZW4ubmFtZSwgbWF4aW11bV9zdXBwbHk6ICcxMDAwMDAwMDAwIFRTVCd9KTtcbiAgICAgICAgZGVwbG95ZXIuZnJvbSh0aGlzLmFjY291bnRfdG9rZW4pO1xuICAgICAgICBkZXBsb3llci5hYmkoQmluYXJpZXMudG9rZW5BYmkpO1xuICAgICAgICBkZXBsb3llci53YXNtKEJpbmFyaWVzLnRva2VuV2FzbSk7XG4gICAgICAgIGRlcGxveWVyLmFmdGVyRGVwbG95KGNyZWF0ZVRva2VuVHJhbnNhY3Rpb24pO1xuICAgICAgICByZXN1bHRzLnB1c2goYXdhaXQgZGVwbG95ZXIuZGVwbG95KCkpO1xuICAgIH1cbiAgICBhc3luYyBncmFudFBlcm1pc3Npb25zKGVvczogYW55KSB7XG4gICAgICAgIGxldCBuZXdQZXJtaXNzaW9uID0ge1xuICAgICAgICAgICAgcGVybWlzc2lvbjoge1xuICAgICAgICAgICAgICAgIGFjdG9yOiAnemFwLm1haW4nLFxuICAgICAgICAgICAgICAgIHBlcm1pc3Npb246ICdlb3Npby5jb2RlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdlaWdodDogMVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCB1c2VyID0gYXdhaXQgZW9zLmdldEFjY291bnQodGhpcy5hY2NvdW50X3VzZXIubmFtZSk7XG4gICAgICAgIGxldCBtYWluID0gYXdhaXQgZW9zLmdldEFjY291bnQodGhpcy56YXAubmFtZSk7XG5cbiAgICAgICAgbGV0IG5ld1VzZXJBdXRoID0gdXNlci5wZXJtaXNzaW9uc1tmaW5kRWxlbWVudCh1c2VyLnBlcm1pc3Npb25zLCAncGVybV9uYW1lJywgJ2FjdGl2ZScpXTtcbiAgICAgICAgbmV3VXNlckF1dGgucmVxdWlyZWRfYXV0aC5hY2NvdW50cy5wdXNoKG5ld1Blcm1pc3Npb24pO1xuXG4gICAgICAgIGxldCBuZXdNYWluQXV0aCA9IG1haW4ucGVybWlzc2lvbnNbZmluZEVsZW1lbnQobWFpbi5wZXJtaXNzaW9ucywgJ3Blcm1fbmFtZScsICdhY3RpdmUnKV07XG4gICAgICAgIG5ld01haW5BdXRoLnJlcXVpcmVkX2F1dGguYWNjb3VudHMucHVzaChuZXdQZXJtaXNzaW9uKTtcblxuICAgICAgICBhd2FpdCBlb3MudHJhbnNhY3Rpb24oKHRyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgdHIudXBkYXRlYXV0aCh7XG4gICAgICAgICAgICAgICAgICBhY2NvdW50OiB1c2VyLmFjY291bnRfbmFtZSxcbiAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb246ICdhY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgcGFyZW50OiAnb3duZXInLFxuICAgICAgICAgICAgICAgICAgYXV0aDogbmV3VXNlckF1dGgucmVxdWlyZWRfYXV0aFxuICAgICAgICAgICAgICB9LCB7YXV0aG9yaXphdGlvbjogYCR7dXNlci5hY2NvdW50X25hbWV9QG93bmVyYH0pO1xuXG5cbiAgICAgICAgICAgICB0ci51cGRhdGVhdXRoKHtcbiAgICAgICAgICAgICAgICAgIGFjY291bnQ6IG1haW4uYWNjb3VudF9uYW1lLFxuICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbjogJ2FjdGl2ZScsXG4gICAgICAgICAgICAgICAgICBwYXJlbnQ6ICdvd25lcicsXG4gICAgICAgICAgICAgICAgICBhdXRoOiBuZXdNYWluQXV0aC5yZXF1aXJlZF9hdXRoXG4gICAgICAgICAgICAgIH0sIHthdXRob3JpemF0aW9uOiBgJHttYWluLmFjY291bnRfbmFtZX1Ab3duZXJgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==