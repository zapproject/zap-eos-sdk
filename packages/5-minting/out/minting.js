"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = __importStar(require("@zapjs/eos-utils"));
const account_1 = require("@zapjs/eos-utils/out/account");
class tokenMinting {
    constructor(account, node) {
        this._node = node;
        this._account = account;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.connect();
        });
    }
    issueTokens(receivers, memo) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = receivers.map(account => new Utils.Transaction()
                .sender(this._account)
                .receiver(this._account)
                .action('issue')
                .data({ to: account.id, quantity: account.quantity, memo })
                .execute(this._node.api));
            return Promise.all(transactions);
        });
    }
    transferTokens(sender, receivers, quantity, memo, type = 'EOS') {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = receivers.map(account => new Utils.Transaction()
                .sender(sender)
                .receiver(type === 'ZAP' ? this._account : new account_1.Account('eosio.token'))
                .action('transfer')
                .data({ from: sender.name, to: account, quantity, memo })
                .execute(this._node.api));
            return Promise.all(transactions);
        });
    }
}
exports.tokenMinting = tokenMinting;
