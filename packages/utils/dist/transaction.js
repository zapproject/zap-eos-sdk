"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Transaction {
    constructor() {
        this.actions = [{}];
        this.actions = [{}];
        this.isTransaction = true;
    }
    sender(account) {
        if (!account.isAccount) {
            throw new Error('Account must be instance of account.js');
        }
        this.actions[0].authorization = [{
                actor: account.name,
                permission: account.default_auth
            }];
        return this;
    }
    receiver(account) {
        if (!account.isAccount) {
            throw new Error('Account must be instance of account.js');
        }
        this.actions[0].account = account.name;
        return this;
    }
    action(action) {
        this.actions[0].name = action;
        return this;
    }
    data(data) {
        this.actions[0].data = data;
        return this;
    }
    merge(transaction) {
        if (!transaction.isTransaction) {
            throw new Error('Account must be instance of account.js');
        }
        for (let i in transaction.actions) {
            if (transaction.actions.hasOwnProperty(i)) {
                this.actions.push(transaction.actions[i]);
            }
        }
        return this;
    }
    build() {
        return { actions: this.actions };
    }
    execute(eos) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield eos.transaction({ actions: this.actions });
        });
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map