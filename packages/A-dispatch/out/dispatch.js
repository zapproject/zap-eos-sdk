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
class Dispatch {
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
    query(provider, endpoint, query, onchain_provider, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account)
                .action('query')
                .data({
                subscriber: this._account.name,
                provider: provider,
                endpoint: endpoint,
                query: query,
                onchain_provider: onchain_provider ? true : false,
                onchain_subscriber: false,
                timestamp: timestamp
            })
                .execute(this._node.api);
        });
    }
    respond(id, params, subscriber) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account)
                .action('respond')
                .data({
                responder: this._account.name,
                id: id,
                params: params,
                subscriber: subscriber
            })
                .execute(this._node.api);
        });
    }
    cancelQuery(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account)
                .action('cancelquery')
                .data({
                subscriber: this._account.name,
                query_id: id,
            })
                .execute(this._node.api);
        });
    }
    queryQueriesInfo(lower_bound, upper_bound, limit, index_position) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.rpc.get_table_rows({
                json: true,
                code: this._zap_account.name,
                scope: this._zap_account.name,
                table: 'qdata',
                lower_bound,
                upper_bound,
                limit,
                key_type: 'i64',
                index_position
            });
        });
    }
}
exports.Dispatch = Dispatch;
