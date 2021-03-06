import {Account} from './account.js';

export class Transaction {
    actions: Array<any> = [{}];
    isTransaction: boolean;

    constructor() {
        this.actions = [{}];
        this.isTransaction = true;
    }

    sender(account: Account) {
        if (!account.isAccount) {
            throw new Error('Account must be instance of account.js');
        }

        this.actions[0].authorization = [{
            actor: account.name,
            permission: account.default_auth
        }];

        return this;
    }

    receiver(account: Account) {
        if (!account.isAccount) {
            throw new Error('Account must be instance of account.js');
        }

        this.actions[0].account = account.name;
        return this;
    }

    action(action: string) {
        this.actions[0].name = action;
        return this;
    }

    data(data: any) {
        this.actions[0].data = data;
        return this;
    }

    merge(transaction: Transaction) {
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

    async execute(eos: any) {
        return await eos.transaction({ actions: this.actions })
    }
}