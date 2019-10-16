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
class Bondage {
    constructor({ account, node }) {
        this._account = account;
        this._node = node;
        this._zap_account = node.getZapAccount();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.connect();
        });
    }
    bond(provider, endpoint, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account)
                .action('bond')
                .data({
                subscriber: this._account.name,
                provider: provider,
                endpoint: endpoint,
                dots: amount
            })
                .execute(this._node.api);
        });
    }
    unbond(provider, endpoint, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account)
                .action('unbond')
                .data({
                subscriber: this._account.name,
                provider: provider,
                endpoint: endpoint,
                dots: amount
            })
                .execute(this._node.api);
        });
    }
    queryHolders(lower_bound, upper_bound, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.rpc.get_table_rows({
                json: true,
                code: this._zap_account.name,
                scope: this._account.name,
                table: 'holder',
                lower_bound,
                upper_bound,
                limit,
                key_type: 'i64',
                index_position: 3
            });
        });
    }
    queryIssued(lower_bound, upper_bound, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.rpc.get_table_rows({
                json: true,
                code: this._zap_account.name,
                scope: this._account.name,
                table: 'issued',
                lower_bound,
                upper_bound,
                limit,
                key_type: 'i64',
                index_position: 1
            });
        });
    }
}
exports.Bondage = Bondage;
