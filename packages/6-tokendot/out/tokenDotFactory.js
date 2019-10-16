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
class TokenDotFactory {
    constructor({ account, node }) {
        this._account = account;
        this._node = node;
        this._zap_account_name = node.getZapAccount();
    }
    tokenCurveInit(name, endpoint, functions, maximum_supply) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Utils.Transaction()
                .sender(this._account)
                .receiver(this._node.getZapAccount())
                .action('tdinit')
                .data({ provider: name, specifier: endpoint, functions: functions, maximum_supply: maximum_supply })
                .execute(this._node.api);
        });
    }
    tokenBond(provider, specifier, dots) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Utils.Transaction()
                .sender(this._account)
                .receiver(this._node.getZapAccount())
                .action('tdbond')
                .data({ issuer: this._account.name, provider, specifier, dots })
                .execute(this._node.api);
        });
    }
    tokenUnBond(provider, specifier, dots) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Utils.Transaction()
                .sender(this._account)
                .receiver(this._node.getZapAccount())
                .action('tdunbond')
                .data({ issuer: this._account.name, provider, specifier, dots })
                .execute(this._node.api);
        });
    }
    getTokenProviders(lower_bound, upper_bound, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows } = yield this._node.rpc.get_table_rows({
                json: true,
                code: this._node.getZapAccount().name,
                scope: this._node.getZapAccount().name,
                table: 'fprovider',
                lower_bound,
                upper_bound,
                limit,
                key_type: 'i64',
                index_position: 1
            });
            return rows;
        });
    }
    getProviderTokens(lower_bound, upper_bound, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows } = yield this._node.rpc.get_table_rows({
                json: true,
                code: this._node.getZapAccount().name,
                scope: this._account.name,
                table: 'ftoken',
                lower_bound,
                upper_bound,
                limit,
                key_type: 'i64',
                index_position: 1
            });
            return rows;
        });
    }
    getSubscriberTokens(lower_bound, upper_bound, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows } = yield this._node.rpc.get_table_rows({
                json: true,
                code: this._node.getZapAccount().name,
                scope: this._account.name,
                table: 'accounts',
                lower_bound,
                upper_bound,
                limit,
                key_type: 'i64',
                index_position: 1
            });
            return rows;
        });
    }
}
exports.TokenDotFactory = TokenDotFactory;
