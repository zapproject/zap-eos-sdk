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
            let eos = yield this.connect();
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
                .execute(eos);
        });
    }
    unbond(provider, endpoint, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
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
                .execute(eos);
        });
    }
    queryHolders(from, to, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
            return yield eos.getTableRows(true, // json
            this._zap_account.name, // code
            this._account.name, // scope
            'holder', // table name
            'provider', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            1 // index position
            );
        });
    }
    queryIssued(provider, from, to, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
            return yield eos.getTableRows(true, // json
            this._zap_account.name, // code
            provider, // scope
            'issued', // table name
            'endpointid', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            1 // index position
            );
        });
    }
    listenBond(callback) {
        let listener = new Utils.DemuxEventListener();
        listener.on(this._node.getZapAccount().name + '::bond', callback);
        return listener;
    }
    listenUnbond(callback) {
        let listener = new Utils.DemuxEventListener();
        listener.on(this._node.getZapAccount().name + '::unbond', callback);
        return listener;
    }
}
exports.Bondage = Bondage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy9ib25kYWdlLnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL2JvbmRhZ2Uvc3JjL2JvbmRhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3REFBMEM7QUFHMUM7SUFLSSxZQUFZLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBaUI7UUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFFN0MsQ0FBQztJQUVLLE9BQU87O1lBQ1QsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEMsQ0FBQztLQUFBO0lBRUssSUFBSSxDQUFDLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxNQUFjOztZQUN6RCxJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUvQixPQUFPLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtpQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7aUJBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2lCQUMzQixNQUFNLENBQUMsTUFBTSxDQUFDO2lCQUNkLElBQUksQ0FBQztnQkFDRixVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJO2dCQUM5QixRQUFRLEVBQUUsUUFBUTtnQkFDbEIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLElBQUksRUFBRSxNQUFNO2FBQ2YsQ0FBQztpQkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQztLQUFBO0lBRUssTUFBTSxDQUFDLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxNQUFjOztZQUMzRCxJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUvQixPQUFPLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtpQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7aUJBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2lCQUMzQixNQUFNLENBQUMsUUFBUSxDQUFDO2lCQUNoQixJQUFJLENBQUM7Z0JBQ0YsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSTtnQkFDOUIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixJQUFJLEVBQUUsTUFBTTthQUNmLENBQUM7aUJBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7S0FBQTtJQUVLLFlBQVksQ0FBQyxJQUFZLEVBQUUsRUFBVSxFQUFFLEtBQWE7O1lBQ3RELElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRS9CLE9BQU8sTUFBTSxHQUFHLENBQUMsWUFBWSxDQUN6QixJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU87WUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUTtZQUM1QixRQUFRLEVBQUUsYUFBYTtZQUN2QixVQUFVLEVBQUUsWUFBWTtZQUN4QixJQUFJLEVBQUUsY0FBYztZQUNwQixFQUFFLEVBQUUsY0FBYztZQUNsQixLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxXQUFXO1lBQ2xCLENBQUMsQ0FBQyxpQkFBaUI7YUFDdEIsQ0FBQztRQUNOLENBQUM7S0FBQTtJQUVLLFdBQVcsQ0FBQyxRQUFnQixFQUFFLElBQVksRUFBRSxFQUFVLEVBQUUsS0FBYTs7WUFDdkUsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFL0IsT0FBTyxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQ3pCLElBQUksRUFBRSxPQUFPO1lBQ2IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTztZQUMvQixRQUFRLEVBQUUsUUFBUTtZQUNsQixRQUFRLEVBQUUsYUFBYTtZQUN2QixZQUFZLEVBQUUsWUFBWTtZQUMxQixJQUFJLEVBQUUsY0FBYztZQUNwQixFQUFFLEVBQUUsY0FBYztZQUNsQixLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxXQUFXO1lBQ2xCLENBQUMsQ0FBQyxpQkFBaUI7YUFDdEIsQ0FBQztRQUNOLENBQUM7S0FBQTtJQUVELFVBQVUsQ0FBQyxRQUFtQjtRQUMxQixJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzlDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEdBQUcsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRWxFLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxZQUFZLENBQUMsUUFBbUI7UUFDNUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM5QyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxHQUFHLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVwRSxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0NBQ0o7QUEvRkQsMEJBK0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgVXRpbHMgZnJvbSBcIkB6YXBqcy9lb3MtdXRpbHNcIjtcbmltcG9ydCB7Qm9uZGFnZU9wdGlvbnN9IGZyb20gXCIuL3R5cGVzL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBCb25kYWdlIHtcbiAgICBfYWNjb3VudDogVXRpbHMuQWNjb3VudDtcbiAgICBfbm9kZTogVXRpbHMuTm9kZTtcbiAgICBfemFwX2FjY291bnQ6IFV0aWxzLkFjY291bnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcih7YWNjb3VudCwgbm9kZX06IEJvbmRhZ2VPcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX2FjY291bnQgPSBhY2NvdW50O1xuICAgICAgICB0aGlzLl9ub2RlID0gbm9kZTtcbiAgICAgICAgdGhpcy5femFwX2FjY291bnQgPSBub2RlLmdldFphcEFjY291bnQoKTtcblxuICAgIH1cblxuICAgIGFzeW5jIGNvbm5lY3QoKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9ub2RlLmNvbm5lY3QoKTtcbiAgICB9XG5cbiAgICBhc3luYyBib25kKHByb3ZpZGVyOiBzdHJpbmcsIGVuZHBvaW50OiBzdHJpbmcsIGFtb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGxldCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFV0aWxzLlRyYW5zYWN0aW9uKClcbiAgICAgICAgICAgIC5zZW5kZXIodGhpcy5fYWNjb3VudClcbiAgICAgICAgICAgIC5yZWNlaXZlcih0aGlzLl96YXBfYWNjb3VudClcbiAgICAgICAgICAgIC5hY3Rpb24oJ2JvbmQnKVxuICAgICAgICAgICAgLmRhdGEoe1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXI6IHRoaXMuX2FjY291bnQubmFtZSxcbiAgICAgICAgICAgICAgICBwcm92aWRlcjogcHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgZW5kcG9pbnQ6IGVuZHBvaW50LFxuICAgICAgICAgICAgICAgIGRvdHM6IGFtb3VudFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5leGVjdXRlKGVvcyk7XG4gICAgfVxuXG4gICAgYXN5bmMgdW5ib25kKHByb3ZpZGVyOiBzdHJpbmcsIGVuZHBvaW50OiBzdHJpbmcsIGFtb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGxldCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFV0aWxzLlRyYW5zYWN0aW9uKClcbiAgICAgICAgICAgIC5zZW5kZXIodGhpcy5fYWNjb3VudClcbiAgICAgICAgICAgIC5yZWNlaXZlcih0aGlzLl96YXBfYWNjb3VudClcbiAgICAgICAgICAgIC5hY3Rpb24oJ3VuYm9uZCcpXG4gICAgICAgICAgICAuZGF0YSh7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlcjogdGhpcy5fYWNjb3VudC5uYW1lLFxuICAgICAgICAgICAgICAgIHByb3ZpZGVyOiBwcm92aWRlcixcbiAgICAgICAgICAgICAgICBlbmRwb2ludDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgICAgZG90czogYW1vdW50XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmV4ZWN1dGUoZW9zKTtcbiAgICB9XG5cbiAgICBhc3luYyBxdWVyeUhvbGRlcnMoZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyLCBsaW1pdDogbnVtYmVyKSB7XG4gICAgICAgIGxldCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgZW9zLmdldFRhYmxlUm93cyhcbiAgICAgICAgICAgIHRydWUsIC8vIGpzb25cbiAgICAgICAgICAgIHRoaXMuX3phcF9hY2NvdW50Lm5hbWUsIC8vIGNvZGVcbiAgICAgICAgICAgIHRoaXMuX2FjY291bnQubmFtZSwgLy8gc2NvcGVcbiAgICAgICAgICAgICdob2xkZXInLCAvLyB0YWJsZSBuYW1lXG4gICAgICAgICAgICAncHJvdmlkZXInLCAvLyB0YWJsZV9rZXlcbiAgICAgICAgICAgIGZyb20sIC8vIGxvd2VyX2JvdW5kXG4gICAgICAgICAgICB0bywgLy8gdXBwZXJfYm91bmRcbiAgICAgICAgICAgIGxpbWl0LCAvLyBsaW1pdFxuICAgICAgICAgICAgJ2k2NCcsIC8vIGtleV90eXBlXG4gICAgICAgICAgICAxIC8vIGluZGV4IHBvc2l0aW9uXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgYXN5bmMgcXVlcnlJc3N1ZWQocHJvdmlkZXI6IHN0cmluZywgZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyLCBsaW1pdDogbnVtYmVyKSB7XG4gICAgICAgIGxldCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgZW9zLmdldFRhYmxlUm93cyhcbiAgICAgICAgICAgIHRydWUsIC8vIGpzb25cbiAgICAgICAgICAgIHRoaXMuX3phcF9hY2NvdW50Lm5hbWUsIC8vIGNvZGVcbiAgICAgICAgICAgIHByb3ZpZGVyLCAvLyBzY29wZVxuICAgICAgICAgICAgJ2lzc3VlZCcsIC8vIHRhYmxlIG5hbWVcbiAgICAgICAgICAgICdlbmRwb2ludGlkJywgLy8gdGFibGVfa2V5XG4gICAgICAgICAgICBmcm9tLCAvLyBsb3dlcl9ib3VuZFxuICAgICAgICAgICAgdG8sIC8vIHVwcGVyX2JvdW5kXG4gICAgICAgICAgICBsaW1pdCwgLy8gbGltaXRcbiAgICAgICAgICAgICdpNjQnLCAvLyBrZXlfdHlwZVxuICAgICAgICAgICAgMSAvLyBpbmRleCBwb3NpdGlvblxuICAgICAgICApO1xuICAgIH1cblxuICAgIGxpc3RlbkJvbmQoY2FsbGJhY2s/OiBGdW5jdGlvbikge1xuICAgICAgICBsZXQgbGlzdGVuZXIgPSBuZXcgVXRpbHMuRGVtdXhFdmVudExpc3RlbmVyKCk7XG4gICAgICAgIGxpc3RlbmVyLm9uKHRoaXMuX25vZGUuZ2V0WmFwQWNjb3VudCgpLm5hbWUgKyAnOjpib25kJywgY2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICB9XG5cbiAgICBsaXN0ZW5VbmJvbmQoY2FsbGJhY2s/OiBGdW5jdGlvbikge1xuICAgICAgICBsZXQgbGlzdGVuZXIgPSBuZXcgVXRpbHMuRGVtdXhFdmVudExpc3RlbmVyKCk7XG4gICAgICAgIGxpc3RlbmVyLm9uKHRoaXMuX25vZGUuZ2V0WmFwQWNjb3VudCgpLm5hbWUgKyAnOjp1bmJvbmQnLCBjYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgIH1cbn1cbiJdfQ==