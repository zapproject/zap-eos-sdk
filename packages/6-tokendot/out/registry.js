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
class Registry {
    constructor({ account, node }) {
        this._account = account;
        this._node = node;
        this._zap_account_name = node.getZapAccount();
    }
    initiateProvider(title, public_key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account_name)
                .action('newprovider')
                .data({ provider: this._account.name, title: title, public_key: public_key })
                .execute(this._node.api);
        });
    }
    addEndpoint(endpoint_specifier, functions, broker) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account_name)
                .action('addendpoint')
                .data({ provider: this._account.name, specifier: endpoint_specifier, functions: functions, broker: broker })
                .execute(this._node.api);
        });
    }
    setParams(endpoint, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account_name)
                .action('setparams')
                .data({ provider: this._account.name, specifier: endpoint, params: params })
                .execute(this._node.api);
        });
    }
    queryProviderList(lower_bound, upper_bound, limit = -1) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.rpc.get_table_rows({
                json: true,
                code: this._zap_account_name.name,
                scope: this._zap_account_name.name,
                table: 'provider',
                lower_bound,
                upper_bound,
                limit,
                key_type: 'i64',
                index_position: 1
            });
        });
    }
    queryParams(lower_bound, upper_bound, limit = -1, index_position) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.rpc.get_table_rows({
                json: true,
                code: this._zap_account_name.name,
                scope: this._account.name,
                table: 'params',
                lower_bound,
                upper_bound,
                limit,
                key_type: (index_position === 2) ? 'i256' : 'i64',
                index_position
            });
        });
    }
    queryProviderEndpoints(lower_bound, upper_bound, limit = -1) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.rpc.get_table_rows({
                json: true,
                code: this._zap_account_name.name,
                scope: this._account.name,
                table: 'endpoint',
                lower_bound,
                upper_bound,
                limit,
                key_type: 'i64',
                index_position: 1
            });
        });
    }
}
exports.Registry = Registry;
