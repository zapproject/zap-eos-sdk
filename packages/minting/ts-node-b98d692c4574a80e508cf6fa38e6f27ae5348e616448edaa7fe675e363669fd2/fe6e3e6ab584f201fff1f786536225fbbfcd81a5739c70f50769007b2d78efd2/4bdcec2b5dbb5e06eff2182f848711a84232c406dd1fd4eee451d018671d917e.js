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
            const eos = yield this.connect();
            const transactions = receivers.map(account => new Utils.Transaction()
                .sender(this._account)
                .receiver(this._account)
                .action('issue')
                .data({ to: account.id, quantity: account.quantity, memo })
                .execute(eos));
            return Promise.all(transactions);
        });
    }
    transferTokens(sender, receivers, quantity, memo) {
        return __awaiter(this, void 0, void 0, function* () {
            const eos = yield this.connect();
            const transactions = receivers.map(account => new Utils.Transaction()
                .sender(sender)
                .receiver(this._account)
                .action('transfer')
                .data({ from: sender.name, to: account, quantity, memo })
                .execute(eos));
            return Promise.all(transactions);
        });
    }
}
exports.tokenMinting = tokenMinting;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvdXNlci96YXAtZW9zLXNkay9wYWNrYWdlcy9taW50aW5nL3NyYy9taW50aW5nLnRzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL3phcC1lb3Mtc2RrL3BhY2thZ2VzL21pbnRpbmcvc3JjL21pbnRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3REFBMEM7QUFHMUM7SUFLSSxZQUFZLE9BQXNCLEVBQUUsSUFBZ0I7UUFDaEQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUVLLE9BQU87O1lBQ1QsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEMsQ0FBQztLQUFBO0lBRUssV0FBVyxDQUFDLFNBQWtELEVBQUUsSUFBWTs7WUFDOUUsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakMsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUN6QyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUU7aUJBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2lCQUNyQixRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztpQkFDdkIsTUFBTSxDQUFDLE9BQU8sQ0FBQztpQkFDZixJQUFJLENBQUMsRUFBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQztpQkFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUNwQixDQUFDO1lBQ0YsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7S0FBQTtJQUVLLGNBQWMsQ0FBQyxNQUFxQixFQUFFLFNBQXdCLEVBQUUsUUFBZ0IsRUFBRSxJQUFZOztZQUNoRyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQyxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQ3pDLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtpQkFDbEIsTUFBTSxDQUFDLE1BQU0sQ0FBQztpQkFDZCxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztpQkFDdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQztpQkFDbEIsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUM7aUJBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXZCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNyQyxDQUFDO0tBQUE7Q0FDSjtBQXZDRCxvQ0F1Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBVdGlscyBmcm9tIFwiQHphcGpzL2Vvcy11dGlsc1wiO1xuXG5cbmV4cG9ydCBjbGFzcyB0b2tlbk1pbnRpbmcge1xuICAgIF9ub2RlOiBVdGlscy5Ob2RlO1xuICAgIF9hY2NvdW50OiBVdGlscy5BY2NvdW50O1xuXG5cbiAgICBjb25zdHJ1Y3RvcihhY2NvdW50OiBVdGlscy5BY2NvdW50LCBub2RlOiBVdGlscy5Ob2RlKSB7XG4gICAgICAgIHRoaXMuX25vZGUgPSBub2RlO1xuICAgICAgICB0aGlzLl9hY2NvdW50ID0gYWNjb3VudDtcbiAgICB9XG5cbiAgICBhc3luYyBjb25uZWN0KCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fbm9kZS5jb25uZWN0KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaXNzdWVUb2tlbnMocmVjZWl2ZXJzOiBBcnJheTx7IGlkOiBzdHJpbmcsIHF1YW50aXR5OiBzdHJpbmcgfT4sIG1lbW86IHN0cmluZykge1xuICAgICAgICBjb25zdCBlb3MgPSBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25zID0gcmVjZWl2ZXJzLm1hcChhY2NvdW50ID0+XG4gICAgICAgICAgICBuZXcgVXRpbHMuVHJhbnNhY3Rpb24oKVxuICAgICAgICAgICAgICAgIC5zZW5kZXIodGhpcy5fYWNjb3VudClcbiAgICAgICAgICAgICAgICAucmVjZWl2ZXIodGhpcy5fYWNjb3VudClcbiAgICAgICAgICAgICAgICAuYWN0aW9uKCdpc3N1ZScpXG4gICAgICAgICAgICAgICAgLmRhdGEoe3RvOiBhY2NvdW50LmlkLCBxdWFudGl0eTogYWNjb3VudC5xdWFudGl0eSwgbWVtb30pXG4gICAgICAgICAgICAgICAgLmV4ZWN1dGUoZW9zKVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwodHJhbnNhY3Rpb25zKTtcbiAgICB9XG5cbiAgICBhc3luYyB0cmFuc2ZlclRva2VucyhzZW5kZXI6IFV0aWxzLkFjY291bnQsIHJlY2VpdmVyczogQXJyYXk8c3RyaW5nPiwgcXVhbnRpdHk6IHN0cmluZywgbWVtbzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGVvcyA9IGF3YWl0IHRoaXMuY29ubmVjdCgpO1xuICAgICAgICBjb25zdCB0cmFuc2FjdGlvbnMgPSByZWNlaXZlcnMubWFwKGFjY291bnQgPT5cbiAgICAgICAgICAgIG5ldyBVdGlscy5UcmFuc2FjdGlvbigpXG4gICAgICAgICAgICAgICAgLnNlbmRlcihzZW5kZXIpXG4gICAgICAgICAgICAgICAgLnJlY2VpdmVyKHRoaXMuX2FjY291bnQpXG4gICAgICAgICAgICAgICAgLmFjdGlvbigndHJhbnNmZXInKVxuICAgICAgICAgICAgICAgIC5kYXRhKHtmcm9tOiBzZW5kZXIubmFtZSwgdG86IGFjY291bnQsIHF1YW50aXR5LCBtZW1vfSlcbiAgICAgICAgICAgICAgICAuZXhlY3V0ZShlb3MpKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwodHJhbnNhY3Rpb25zKTtcbiAgICB9XG59XG4iXX0=