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
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.connect();
        });
    }
    initiateProvider(title, public_key) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
            return yield new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account_name)
                .action('newprovider')
                .data({ provider: this._account.name, title: title, public_key: public_key })
                .execute(eos);
        });
    }
    addEndpoint(endpoint_specifier, functions, broker) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
            return yield new Utils.Transaction()
                .sender(this._account)
                .receiver(this._zap_account_name)
                .action('addendpoint')
                .data({ provider: this._account.name, specifier: endpoint_specifier, functions: functions, broker: broker })
                .execute(eos);
        });
    }
    queryProviderList(from, to, limit = -1) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
            return yield eos.getTableRows(true, // json
            this._zap_account_name.name, // code
            this._zap_account_name.name, // scope
            'provider', // table name
            'user', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            1 // index position
            );
        });
    }
    queryProviderEndpoints(from, to, limit = -1) {
        return __awaiter(this, void 0, void 0, function* () {
            let eos = yield this.connect();
            return yield eos.getTableRows(true, // json
            this._zap_account_name.name, // code
            this._account.name, // scope
            'endpoint', // table name
            'id', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            1 // index position
            );
        });
    }
    listenNewProvider(callback) {
        let listener = new Utils.SimpleEventListener(this._node.eos_config.httpEndpoint, 1);
        listener.listen(callback, this._node.getZapAccount().name + '::newprovider');
        return listener;
    }
    listenNewEndpoint(callback) {
        let listener = new Utils.SimpleEventListener(this._node.eos_config.httpEndpoint, 1);
        listener.listen(callback, this._node.getZapAccount().name + '::addendpoint');
        return listener;
    }
}
exports.Registry = Registry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9yZWdpc3RyeS9zcmMvcmVnaXN0cnkudHMiLCJzb3VyY2VzIjpbIi9ob21lL3VzZXIvemFwLWVvcy1zZGsvcGFja2FnZXMvcmVnaXN0cnkvc3JjL3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0RBQTBDO0FBRzFDO0lBS0ksWUFBWSxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQWtCO1FBQ3hDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDbEQsQ0FBQztJQUVLLE9BQU87O1lBQ1QsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEMsQ0FBQztLQUFBO0lBRUssZ0JBQWdCLENBQUMsS0FBYSxFQUFFLFVBQWtCOztZQUNwRCxJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUvQixPQUFPLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFO2lCQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztpQkFDckIsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztpQkFDaEMsTUFBTSxDQUFDLGFBQWEsQ0FBQztpQkFDckIsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBQyxDQUFDO2lCQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQztLQUFBO0lBRUssV0FBVyxDQUFDLGtCQUEwQixFQUFFLFNBQXdCLEVBQUUsTUFBYzs7WUFDbEYsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFHL0IsT0FBTyxNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtpQkFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7aUJBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7aUJBQ2hDLE1BQU0sQ0FBQyxhQUFhLENBQUM7aUJBQ3JCLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUM7aUJBQ3pHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixDQUFDO0tBQUE7SUFFSyxpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsRUFBVSxFQUFFLFFBQWdCLENBQUMsQ0FBQzs7WUFDaEUsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFL0IsT0FBTyxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQ3pCLElBQUksRUFBRSxPQUFPO1lBQ2IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPO1lBQ3BDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsUUFBUTtZQUNyQyxVQUFVLEVBQUUsYUFBYTtZQUN6QixNQUFNLEVBQUUsWUFBWTtZQUNwQixJQUFJLEVBQUUsY0FBYztZQUNwQixFQUFFLEVBQUUsY0FBYztZQUNsQixLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxXQUFXO1lBQ2xCLENBQUMsQ0FBQyxpQkFBaUI7YUFDdEIsQ0FBQztRQUNOLENBQUM7S0FBQTtJQUVLLHNCQUFzQixDQUFDLElBQVksRUFBRSxFQUFVLEVBQUUsUUFBZ0IsQ0FBQyxDQUFDOztZQUNyRSxJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUvQixPQUFPLE1BQU0sR0FBRyxDQUFDLFlBQVksQ0FDekIsSUFBSSxFQUFFLE9BQU87WUFDYixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLE9BQU87WUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUTtZQUM1QixVQUFVLEVBQUUsYUFBYTtZQUN6QixJQUFJLEVBQUUsWUFBWTtZQUNsQixJQUFJLEVBQUUsY0FBYztZQUNwQixFQUFFLEVBQUUsY0FBYztZQUNsQixLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxXQUFXO1lBQ2xCLENBQUMsQ0FBQyxpQkFBaUI7YUFDdEIsQ0FBQztRQUNOLENBQUM7S0FBQTtJQUVELGlCQUFpQixDQUFDLFFBQW1CO1FBQ2pDLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNuRixRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksR0FBRyxlQUFlLENBQUMsQ0FBQztRQUU3RSxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRUQsaUJBQWlCLENBQUMsUUFBbUI7UUFDakMsSUFBSSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ25GLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQyxDQUFDO1FBRTdFLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7Q0FDSjtBQXJGRCw0QkFxRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBVdGlscyBmcm9tIFwiQHphcGpzL2Vvcy11dGlsc1wiO1xuaW1wb3J0IHtSZWdpc3RyeU9wdGlvbnN9IGZyb20gXCIuL3R5cGVzL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBSZWdpc3RyeSB7XG4gICAgX2FjY291bnQ6IFV0aWxzLkFjY291bnQ7XG4gICAgX25vZGU6IFV0aWxzLk5vZGU7XG4gICAgX3phcF9hY2NvdW50X25hbWU6IFV0aWxzLkFjY291bnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcih7YWNjb3VudCwgbm9kZX06IFJlZ2lzdHJ5T3B0aW9ucykge1xuICAgICAgICB0aGlzLl9hY2NvdW50ID0gYWNjb3VudDtcbiAgICAgICAgdGhpcy5fbm9kZSA9IG5vZGU7XG4gICAgICAgIHRoaXMuX3phcF9hY2NvdW50X25hbWUgPSBub2RlLmdldFphcEFjY291bnQoKTtcbiAgICB9XG5cbiAgICBhc3luYyBjb25uZWN0KCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fbm9kZS5jb25uZWN0KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdGlhdGVQcm92aWRlcih0aXRsZTogc3RyaW5nLCBwdWJsaWNfa2V5OiBudW1iZXIpIHtcbiAgICAgICAgbGV0IGVvcyA9IGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCBuZXcgVXRpbHMuVHJhbnNhY3Rpb24oKVxuICAgICAgICAgICAgLnNlbmRlcih0aGlzLl9hY2NvdW50KVxuICAgICAgICAgICAgLnJlY2VpdmVyKHRoaXMuX3phcF9hY2NvdW50X25hbWUpXG4gICAgICAgICAgICAuYWN0aW9uKCduZXdwcm92aWRlcicpXG4gICAgICAgICAgICAuZGF0YSh7cHJvdmlkZXI6IHRoaXMuX2FjY291bnQubmFtZSwgdGl0bGU6IHRpdGxlLCBwdWJsaWNfa2V5OiBwdWJsaWNfa2V5fSlcbiAgICAgICAgICAgIC5leGVjdXRlKGVvcyk7XG4gICAgfVxuXG4gICAgYXN5bmMgYWRkRW5kcG9pbnQoZW5kcG9pbnRfc3BlY2lmaWVyOiBzdHJpbmcsIGZ1bmN0aW9uczogQXJyYXk8bnVtYmVyPiwgYnJva2VyOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGVvcyA9IGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuXG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IG5ldyBVdGlscy5UcmFuc2FjdGlvbigpXG4gICAgICAgICAgICAuc2VuZGVyKHRoaXMuX2FjY291bnQpXG4gICAgICAgICAgICAucmVjZWl2ZXIodGhpcy5femFwX2FjY291bnRfbmFtZSlcbiAgICAgICAgICAgIC5hY3Rpb24oJ2FkZGVuZHBvaW50JylcbiAgICAgICAgICAgIC5kYXRhKHtwcm92aWRlcjogdGhpcy5fYWNjb3VudC5uYW1lLCBzcGVjaWZpZXI6IGVuZHBvaW50X3NwZWNpZmllciwgZnVuY3Rpb25zOiBmdW5jdGlvbnMsIGJyb2tlcjogYnJva2VyfSlcbiAgICAgICAgICAgIC5leGVjdXRlKGVvcyk7XG4gICAgfVxuXG4gICAgYXN5bmMgcXVlcnlQcm92aWRlckxpc3QoZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyLCBsaW1pdDogbnVtYmVyID0gLTEpIHtcbiAgICAgICAgbGV0IGVvcyA9IGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCBlb3MuZ2V0VGFibGVSb3dzKFxuICAgICAgICAgICAgdHJ1ZSwgLy8ganNvblxuICAgICAgICAgICAgdGhpcy5femFwX2FjY291bnRfbmFtZS5uYW1lLCAvLyBjb2RlXG4gICAgICAgICAgICB0aGlzLl96YXBfYWNjb3VudF9uYW1lLm5hbWUsIC8vIHNjb3BlXG4gICAgICAgICAgICAncHJvdmlkZXInLCAvLyB0YWJsZSBuYW1lXG4gICAgICAgICAgICAndXNlcicsIC8vIHRhYmxlX2tleVxuICAgICAgICAgICAgZnJvbSwgLy8gbG93ZXJfYm91bmRcbiAgICAgICAgICAgIHRvLCAvLyB1cHBlcl9ib3VuZFxuICAgICAgICAgICAgbGltaXQsIC8vIGxpbWl0XG4gICAgICAgICAgICAnaTY0JywgLy8ga2V5X3R5cGVcbiAgICAgICAgICAgIDEgLy8gaW5kZXggcG9zaXRpb25cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBhc3luYyBxdWVyeVByb3ZpZGVyRW5kcG9pbnRzKGZyb206IG51bWJlciwgdG86IG51bWJlciwgbGltaXQ6IG51bWJlciA9IC0xKSB7XG4gICAgICAgIGxldCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgZW9zLmdldFRhYmxlUm93cyhcbiAgICAgICAgICAgIHRydWUsIC8vIGpzb25cbiAgICAgICAgICAgIHRoaXMuX3phcF9hY2NvdW50X25hbWUubmFtZSwgLy8gY29kZVxuICAgICAgICAgICAgdGhpcy5fYWNjb3VudC5uYW1lLCAvLyBzY29wZVxuICAgICAgICAgICAgJ2VuZHBvaW50JywgLy8gdGFibGUgbmFtZVxuICAgICAgICAgICAgJ2lkJywgLy8gdGFibGVfa2V5XG4gICAgICAgICAgICBmcm9tLCAvLyBsb3dlcl9ib3VuZFxuICAgICAgICAgICAgdG8sIC8vIHVwcGVyX2JvdW5kXG4gICAgICAgICAgICBsaW1pdCwgLy8gbGltaXRcbiAgICAgICAgICAgICdpNjQnLCAvLyBrZXlfdHlwZVxuICAgICAgICAgICAgMSAvLyBpbmRleCBwb3NpdGlvblxuICAgICAgICApO1xuICAgIH1cblxuICAgIGxpc3Rlbk5ld1Byb3ZpZGVyKGNhbGxiYWNrPzogRnVuY3Rpb24pIHtcbiAgICAgICAgbGV0IGxpc3RlbmVyID0gbmV3IFV0aWxzLlNpbXBsZUV2ZW50TGlzdGVuZXIodGhpcy5fbm9kZS5lb3NfY29uZmlnLmh0dHBFbmRwb2ludCwgMSlcbiAgICAgICAgbGlzdGVuZXIubGlzdGVuKGNhbGxiYWNrLCB0aGlzLl9ub2RlLmdldFphcEFjY291bnQoKS5uYW1lICsgJzo6bmV3cHJvdmlkZXInKTtcblxuICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgfVxuXG4gICAgbGlzdGVuTmV3RW5kcG9pbnQoY2FsbGJhY2s/OiBGdW5jdGlvbikge1xuICAgICAgICBsZXQgbGlzdGVuZXIgPSBuZXcgVXRpbHMuU2ltcGxlRXZlbnRMaXN0ZW5lcih0aGlzLl9ub2RlLmVvc19jb25maWcuaHR0cEVuZHBvaW50LCAxKVxuICAgICAgICBsaXN0ZW5lci5saXN0ZW4oY2FsbGJhY2ssIHRoaXMuX25vZGUuZ2V0WmFwQWNjb3VudCgpLm5hbWUgKyAnOjphZGRlbmRwb2ludCcpO1xuXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICB9XG59XG4iXX0=