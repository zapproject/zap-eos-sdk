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
        let listener = new Utils.SimpleEventListener(this._node.eos_config.httpEndpoint, 1);
        listener.listen(callback, this._node.getZapAccount().name + '::bond');
        return listener;
    }
    listenUnbond(callback) {
        let listener = new Utils.SimpleEventListener(this._node.eos_config.httpEndpoint, 1);
        listener.listen(callback, this._node.getZapAccount().name + '::unbond');
        return listener;
    }
}
exports.Bondage = Bondage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9ib25kYWdlL3NyYy9ib25kYWdlLnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL2JvbmRhZ2Uvc3JjL2JvbmRhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3REFBMEM7QUFHMUM7SUFLSSxZQUFZLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBaUI7UUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFFN0MsQ0FBQztJQUVLLE9BQU87O1lBQ1QsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEMsQ0FBQztLQUFBO0lBRUssSUFBSSxDQUFDLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxNQUFjOztZQUN6RCxJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUvQixPQUFPLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtpQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7aUJBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2lCQUMzQixNQUFNLENBQUMsTUFBTSxDQUFDO2lCQUNkLElBQUksQ0FBQztnQkFDRixVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJO2dCQUM5QixRQUFRLEVBQUUsUUFBUTtnQkFDbEIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLElBQUksRUFBRSxNQUFNO2FBQ2YsQ0FBQztpQkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQztLQUFBO0lBRUssTUFBTSxDQUFDLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxNQUFjOztZQUMzRCxJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUvQixPQUFPLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtpQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7aUJBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2lCQUMzQixNQUFNLENBQUMsUUFBUSxDQUFDO2lCQUNoQixJQUFJLENBQUM7Z0JBQ0YsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSTtnQkFDOUIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixJQUFJLEVBQUUsTUFBTTthQUNmLENBQUM7aUJBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7S0FBQTtJQUVLLFlBQVksQ0FBQyxJQUFZLEVBQUUsRUFBVSxFQUFFLEtBQWE7O1lBQ3RELElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRS9CLE9BQU8sTUFBTSxHQUFHLENBQUMsWUFBWSxDQUN6QixJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU87WUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUTtZQUM1QixRQUFRLEVBQUUsYUFBYTtZQUN2QixVQUFVLEVBQUUsWUFBWTtZQUN4QixJQUFJLEVBQUUsY0FBYztZQUNwQixFQUFFLEVBQUUsY0FBYztZQUNsQixLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxXQUFXO1lBQ2xCLENBQUMsQ0FBQyxpQkFBaUI7YUFDdEIsQ0FBQztRQUNOLENBQUM7S0FBQTtJQUVLLFdBQVcsQ0FBQyxRQUFnQixFQUFFLElBQVksRUFBRSxFQUFVLEVBQUUsS0FBYTs7WUFDdkUsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFL0IsT0FBTyxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQ3pCLElBQUksRUFBRSxPQUFPO1lBQ2IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTztZQUMvQixRQUFRLEVBQUUsUUFBUTtZQUNsQixRQUFRLEVBQUUsYUFBYTtZQUN2QixZQUFZLEVBQUUsWUFBWTtZQUMxQixJQUFJLEVBQUUsY0FBYztZQUNwQixFQUFFLEVBQUUsY0FBYztZQUNsQixLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxXQUFXO1lBQ2xCLENBQUMsQ0FBQyxpQkFBaUI7YUFDdEIsQ0FBQztRQUNOLENBQUM7S0FBQTtJQUVELFVBQVUsQ0FBQyxRQUFtQjtRQUMxQixJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDbkYsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFFdEUsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUVELFlBQVksQ0FBQyxRQUFtQjtRQUM1QixJQUFJLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDbkYsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUM7UUFFeEUsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztDQUNKO0FBL0ZELDBCQStGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFV0aWxzIGZyb20gXCJAemFwanMvZW9zLXV0aWxzXCI7XG5pbXBvcnQge0JvbmRhZ2VPcHRpb25zfSBmcm9tIFwiLi90eXBlcy90eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgQm9uZGFnZSB7XG4gICAgX2FjY291bnQ6IFV0aWxzLkFjY291bnQ7XG4gICAgX25vZGU6IFV0aWxzLk5vZGU7XG4gICAgX3phcF9hY2NvdW50OiBVdGlscy5BY2NvdW50O1xuXG4gICAgY29uc3RydWN0b3Ioe2FjY291bnQsIG5vZGV9OiBCb25kYWdlT3B0aW9ucykge1xuICAgICAgICB0aGlzLl9hY2NvdW50ID0gYWNjb3VudDtcbiAgICAgICAgdGhpcy5fbm9kZSA9IG5vZGU7XG4gICAgICAgIHRoaXMuX3phcF9hY2NvdW50ID0gbm9kZS5nZXRaYXBBY2NvdW50KCk7XG5cbiAgICB9XG5cbiAgICBhc3luYyBjb25uZWN0KCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fbm9kZS5jb25uZWN0KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgYm9uZChwcm92aWRlcjogc3RyaW5nLCBlbmRwb2ludDogc3RyaW5nLCBhbW91bnQ6IG51bWJlcikge1xuICAgICAgICBsZXQgZW9zID0gYXdhaXQgdGhpcy5jb25uZWN0KCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBVdGlscy5UcmFuc2FjdGlvbigpXG4gICAgICAgICAgICAuc2VuZGVyKHRoaXMuX2FjY291bnQpXG4gICAgICAgICAgICAucmVjZWl2ZXIodGhpcy5femFwX2FjY291bnQpXG4gICAgICAgICAgICAuYWN0aW9uKCdib25kJylcbiAgICAgICAgICAgIC5kYXRhKHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyOiB0aGlzLl9hY2NvdW50Lm5hbWUsXG4gICAgICAgICAgICAgICAgcHJvdmlkZXI6IHByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIGVuZHBvaW50OiBlbmRwb2ludCxcbiAgICAgICAgICAgICAgICBkb3RzOiBhbW91bnRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZXhlY3V0ZShlb3MpO1xuICAgIH1cblxuICAgIGFzeW5jIHVuYm9uZChwcm92aWRlcjogc3RyaW5nLCBlbmRwb2ludDogc3RyaW5nLCBhbW91bnQ6IG51bWJlcikge1xuICAgICAgICBsZXQgZW9zID0gYXdhaXQgdGhpcy5jb25uZWN0KCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBVdGlscy5UcmFuc2FjdGlvbigpXG4gICAgICAgICAgICAuc2VuZGVyKHRoaXMuX2FjY291bnQpXG4gICAgICAgICAgICAucmVjZWl2ZXIodGhpcy5femFwX2FjY291bnQpXG4gICAgICAgICAgICAuYWN0aW9uKCd1bmJvbmQnKVxuICAgICAgICAgICAgLmRhdGEoe1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXI6IHRoaXMuX2FjY291bnQubmFtZSxcbiAgICAgICAgICAgICAgICBwcm92aWRlcjogcHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgZW5kcG9pbnQ6IGVuZHBvaW50LFxuICAgICAgICAgICAgICAgIGRvdHM6IGFtb3VudFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5leGVjdXRlKGVvcyk7XG4gICAgfVxuXG4gICAgYXN5bmMgcXVlcnlIb2xkZXJzKGZyb206IG51bWJlciwgdG86IG51bWJlciwgbGltaXQ6IG51bWJlcikge1xuICAgICAgICBsZXQgZW9zID0gYXdhaXQgdGhpcy5jb25uZWN0KCk7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IGVvcy5nZXRUYWJsZVJvd3MoXG4gICAgICAgICAgICB0cnVlLCAvLyBqc29uXG4gICAgICAgICAgICB0aGlzLl96YXBfYWNjb3VudC5uYW1lLCAvLyBjb2RlXG4gICAgICAgICAgICB0aGlzLl9hY2NvdW50Lm5hbWUsIC8vIHNjb3BlXG4gICAgICAgICAgICAnaG9sZGVyJywgLy8gdGFibGUgbmFtZVxuICAgICAgICAgICAgJ3Byb3ZpZGVyJywgLy8gdGFibGVfa2V5XG4gICAgICAgICAgICBmcm9tLCAvLyBsb3dlcl9ib3VuZFxuICAgICAgICAgICAgdG8sIC8vIHVwcGVyX2JvdW5kXG4gICAgICAgICAgICBsaW1pdCwgLy8gbGltaXRcbiAgICAgICAgICAgICdpNjQnLCAvLyBrZXlfdHlwZVxuICAgICAgICAgICAgMSAvLyBpbmRleCBwb3NpdGlvblxuICAgICAgICApO1xuICAgIH1cblxuICAgIGFzeW5jIHF1ZXJ5SXNzdWVkKHByb3ZpZGVyOiBzdHJpbmcsIGZyb206IG51bWJlciwgdG86IG51bWJlciwgbGltaXQ6IG51bWJlcikge1xuICAgICAgICBsZXQgZW9zID0gYXdhaXQgdGhpcy5jb25uZWN0KCk7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IGVvcy5nZXRUYWJsZVJvd3MoXG4gICAgICAgICAgICB0cnVlLCAvLyBqc29uXG4gICAgICAgICAgICB0aGlzLl96YXBfYWNjb3VudC5uYW1lLCAvLyBjb2RlXG4gICAgICAgICAgICBwcm92aWRlciwgLy8gc2NvcGVcbiAgICAgICAgICAgICdpc3N1ZWQnLCAvLyB0YWJsZSBuYW1lXG4gICAgICAgICAgICAnZW5kcG9pbnRpZCcsIC8vIHRhYmxlX2tleVxuICAgICAgICAgICAgZnJvbSwgLy8gbG93ZXJfYm91bmRcbiAgICAgICAgICAgIHRvLCAvLyB1cHBlcl9ib3VuZFxuICAgICAgICAgICAgbGltaXQsIC8vIGxpbWl0XG4gICAgICAgICAgICAnaTY0JywgLy8ga2V5X3R5cGVcbiAgICAgICAgICAgIDEgLy8gaW5kZXggcG9zaXRpb25cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBsaXN0ZW5Cb25kKGNhbGxiYWNrPzogRnVuY3Rpb24pIHtcbiAgICAgICAgbGV0IGxpc3RlbmVyID0gbmV3IFV0aWxzLlNpbXBsZUV2ZW50TGlzdGVuZXIodGhpcy5fbm9kZS5lb3NfY29uZmlnLmh0dHBFbmRwb2ludCwgMSlcbiAgICAgICAgbGlzdGVuZXIubGlzdGVuKGNhbGxiYWNrLCB0aGlzLl9ub2RlLmdldFphcEFjY291bnQoKS5uYW1lICsgJzo6Ym9uZCcpO1xuXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICB9XG5cbiAgICBsaXN0ZW5VbmJvbmQoY2FsbGJhY2s/OiBGdW5jdGlvbikge1xuICAgICAgICBsZXQgbGlzdGVuZXIgPSBuZXcgVXRpbHMuU2ltcGxlRXZlbnRMaXN0ZW5lcih0aGlzLl9ub2RlLmVvc19jb25maWcuaHR0cEVuZHBvaW50LCAxKVxuICAgICAgICBsaXN0ZW5lci5saXN0ZW4oY2FsbGJhY2ssIHRoaXMuX25vZGUuZ2V0WmFwQWNjb3VudCgpLm5hbWUgKyAnOjp1bmJvbmQnKTtcblxuICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgfVxufVxuIl19