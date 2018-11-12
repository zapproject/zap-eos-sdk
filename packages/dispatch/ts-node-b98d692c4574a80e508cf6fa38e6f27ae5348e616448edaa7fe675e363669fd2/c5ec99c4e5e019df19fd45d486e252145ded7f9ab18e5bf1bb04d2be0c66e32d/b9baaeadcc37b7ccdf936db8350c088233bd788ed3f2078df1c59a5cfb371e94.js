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
    query(provider, endpoint, query, onchain_provider) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
            return new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account)
                .action('query')
                .data({
                subscriber: this._account.name,
                provider: provider,
                endpoint: endpoint,
                query: query,
                onchain_provider: onchain_provider ? 1 : 0,
                onchain_subscriber: 0 // if we call it from js then it not onchain subscriber
            })
                .execute(eos);
        });
    }
    respond(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
            return new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account)
                .action('respond')
                .data({
                responder: this._account.name,
                id: id,
                params: params
            })
                .execute(eos);
        });
    }
    cancelQuery(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
            return new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account)
                .action('cancelquery')
                .data({
                subscriber: this._account.name,
                query_id: id,
            })
                .execute(eos);
        });
    }
    queryQueriesInfo(from, to, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
            return yield eos.getTableRows(true, // json
            this._zap_account.name, // code
            this._account.name, // scope
            'qdata', // table name
            'id', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            1 // index position
            );
        });
    }
    listenQuries(callback) {
        let listener = new Utils.SimpleEventListener(this._node.eos_config.httpEndpoint, 1);
        listener.listen(callback, this._node.getZapAccount().name + '::query');
        return listener;
    }
    listenResponses(callback) {
        let listener = new Utils.SimpleEventListener(this._node.eos_config.httpEndpoint, 1);
        listener.listen(callback, this._node.getZapAccount().name + '::respond');
        return listener;
    }
    listenCancels(callback) {
        let listener = new Utils.SimpleEventListener(this._node.eos_config.httpEndpoint, 1);
        listener.listen(callback, this._node.getZapAccount().name + '::cancelquery');
        return listener;
    }
}
exports.Dispatch = Dispatch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9kaXNwYXRjaC9zcmMvZGlzcGF0Y2gudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvZGlzcGF0Y2gvc3JjL2Rpc3BhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0RBQTBDO0FBRzFDO0lBS0ksWUFBWSxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQWtCO1FBQ3hDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFFSyxPQUFPOztZQUNULE9BQU8sTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RDLENBQUM7S0FBQTtJQUVLLEtBQUssQ0FBQyxRQUFnQixFQUFFLFFBQWdCLEVBQUUsS0FBYSxFQUFFLGdCQUF5Qjs7WUFDcEYsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFL0IsT0FBTyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUU7aUJBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2lCQUNyQixRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztpQkFDM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQztpQkFDZixJQUFJLENBQUM7Z0JBQ0YsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSTtnQkFDOUIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixLQUFLLEVBQUUsS0FBSztnQkFDWixnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxrQkFBa0Is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QVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDbkYsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEdBQUcsZUFBZSxDQUFDLENBQUM7UUFFN0UsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztDQUNKO0FBbkdELDRCQW1HQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFV0aWxzIGZyb20gXCJAemFwanMvZW9zLXV0aWxzXCI7XG5pbXBvcnQge0Rpc3BhdGNoT3B0aW9uc30gZnJvbSBcIi4vdHlwZXMvdHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIERpc3BhdGNoIHtcbiAgICBfYWNjb3VudDogVXRpbHMuQWNjb3VudDtcbiAgICBfbm9kZTogVXRpbHMuTm9kZTtcbiAgICBfemFwX2FjY291bnQ6IFV0aWxzLkFjY291bnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcih7YWNjb3VudCwgbm9kZX06IERpc3BhdGNoT3B0aW9ucykge1xuICAgICAgICB0aGlzLl9hY2NvdW50ID0gYWNjb3VudDtcbiAgICAgICAgdGhpcy5fbm9kZSA9IG5vZGU7XG4gICAgICAgIHRoaXMuX3phcF9hY2NvdW50ID0gbm9kZS5nZXRaYXBBY2NvdW50KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgY29ubmVjdCgpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX25vZGUuY29ubmVjdCgpO1xuICAgIH1cblxuICAgIGFzeW5jIHF1ZXJ5KHByb3ZpZGVyOiBzdHJpbmcsIGVuZHBvaW50OiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcsIG9uY2hhaW5fcHJvdmlkZXI6IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IGVvcyA9IGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuXG4gICAgICAgIHJldHVybiBuZXcgVXRpbHMuVHJhbnNhY3Rpb24oKVxuICAgICAgICAgICAgLnNlbmRlcih0aGlzLl9hY2NvdW50KVxuICAgICAgICAgICAgLnJlY2VpdmVyKHRoaXMuX3phcF9hY2NvdW50KVxuICAgICAgICAgICAgLmFjdGlvbigncXVlcnknKVxuICAgICAgICAgICAgLmRhdGEoe1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXI6IHRoaXMuX2FjY291bnQubmFtZSxcbiAgICAgICAgICAgICAgICBwcm92aWRlcjogcHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgZW5kcG9pbnQ6IGVuZHBvaW50LFxuICAgICAgICAgICAgICAgIHF1ZXJ5OiBxdWVyeSxcbiAgICAgICAgICAgICAgICBvbmNoYWluX3Byb3ZpZGVyOiBvbmNoYWluX3Byb3ZpZGVyID8gMSA6IDAsXG4gICAgICAgICAgICAgICAgb25jaGFpbl9zdWJzY3JpYmVyOiAwIC8vIGlmIHdlIGNhbGwgaXQgZnJvbSBqcyB0aGVuIGl0IG5vdCBvbmNoYWluIHN1YnNjcmliZXJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXhlY3V0ZShlb3MpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlc3BvbmQoaWQ6IG51bWJlciwgcGFyYW1zOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGVvcyA9IGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuXG4gICAgICAgIHJldHVybiBuZXcgVXRpbHMuVHJhbnNhY3Rpb24oKVxuICAgICAgICAgICAgLnNlbmRlcih0aGlzLl9hY2NvdW50KVxuICAgICAgICAgICAgLnJlY2VpdmVyKHRoaXMuX3phcF9hY2NvdW50KVxuICAgICAgICAgICAgLmFjdGlvbigncmVzcG9uZCcpXG4gICAgICAgICAgICAuZGF0YSh7XG4gICAgICAgICAgICAgICAgcmVzcG9uZGVyOiB0aGlzLl9hY2NvdW50Lm5hbWUsXG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1zXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmV4ZWN1dGUoZW9zKTtcbiAgICB9XG5cbiAgICBhc3luYyBjYW5jZWxRdWVyeShpZDogbnVtYmVyKSB7XG4gICAgICAgIGxldCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFV0aWxzLlRyYW5zYWN0aW9uKClcbiAgICAgICAgICAgIC5zZW5kZXIodGhpcy5fYWNjb3VudClcbiAgICAgICAgICAgIC5yZWNlaXZlcih0aGlzLl96YXBfYWNjb3VudClcbiAgICAgICAgICAgIC5hY3Rpb24oJ2NhbmNlbHF1ZXJ5JylcbiAgICAgICAgICAgIC5kYXRhKHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyOiB0aGlzLl9hY2NvdW50Lm5hbWUsXG4gICAgICAgICAgICAgICAgcXVlcnlfaWQ6IGlkLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5leGVjdXRlKGVvcyk7XG4gICAgfVxuXG4gICAgYXN5bmMgcXVlcnlRdWVyaWVzSW5mbyhmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIsIGxpbWl0OiBudW1iZXIpIHtcbiAgICAgICAgbGV0IGVvcyA9IGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCBlb3MuZ2V0VGFibGVSb3dzKFxuICAgICAgICAgICAgdHJ1ZSwgLy8ganNvblxuICAgICAgICAgICAgdGhpcy5femFwX2FjY291bnQubmFtZSwgLy8gY29kZVxuICAgICAgICAgICAgdGhpcy5fYWNjb3VudC5uYW1lLCAvLyBzY29wZVxuICAgICAgICAgICAgJ3FkYXRhJywgLy8gdGFibGUgbmFtZVxuICAgICAgICAgICAgJ2lkJywgLy8gdGFibGVfa2V5XG4gICAgICAgICAgICBmcm9tLCAvLyBsb3dlcl9ib3VuZFxuICAgICAgICAgICAgdG8sIC8vIHVwcGVyX2JvdW5kXG4gICAgICAgICAgICBsaW1pdCwgLy8gbGltaXRcbiAgICAgICAgICAgICdpNjQnLCAvLyBrZXlfdHlwZVxuICAgICAgICAgICAgMSAvLyBpbmRleCBwb3NpdGlvblxuICAgICAgICApO1xuICAgIH1cblxuICAgIGxpc3RlblF1cmllcyhjYWxsYmFjaz86IEZ1bmN0aW9uKSB7XG4gICAgICAgIGxldCBsaXN0ZW5lciA9IG5ldyBVdGlscy5TaW1wbGVFdmVudExpc3RlbmVyKHRoaXMuX25vZGUuZW9zX2NvbmZpZy5odHRwRW5kcG9pbnQsIDEpXG4gICAgICAgIGxpc3RlbmVyLmxpc3RlbihjYWxsYmFjaywgdGhpcy5fbm9kZS5nZXRaYXBBY2NvdW50KCkubmFtZSArICc6OnF1ZXJ5Jyk7XG5cbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgIH1cblxuICAgIGxpc3RlblJlc3BvbnNlcyhjYWxsYmFjaz86IEZ1bmN0aW9uKSB7XG4gICAgICAgIGxldCBsaXN0ZW5lciA9IG5ldyBVdGlscy5TaW1wbGVFdmVudExpc3RlbmVyKHRoaXMuX25vZGUuZW9zX2NvbmZpZy5odHRwRW5kcG9pbnQsIDEpXG4gICAgICAgIGxpc3RlbmVyLmxpc3RlbihjYWxsYmFjaywgdGhpcy5fbm9kZS5nZXRaYXBBY2NvdW50KCkubmFtZSArICc6OnJlc3BvbmQnKTtcblxuICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgfVxuXG4gICAgbGlzdGVuQ2FuY2VscyhjYWxsYmFjaz86IEZ1bmN0aW9uKSB7XG4gICAgICAgIGxldCBsaXN0ZW5lciA9IG5ldyBVdGlscy5TaW1wbGVFdmVudExpc3RlbmVyKHRoaXMuX25vZGUuZW9zX2NvbmZpZy5odHRwRW5kcG9pbnQsIDEpXG4gICAgICAgIGxpc3RlbmVyLmxpc3RlbihjYWxsYmFjaywgdGhpcy5fbm9kZS5nZXRaYXBBY2NvdW50KCkubmFtZSArICc6OmNhbmNlbHF1ZXJ5Jyk7XG5cbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgIH1cbn1cbiJdfQ==