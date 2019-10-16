import { Account } from './account.js';
export declare class Transaction {
    actions: Array<any>;
    isTransaction: boolean;
    constructor();
    sender(account: Account, authorization?: string): this;
    receiver(account: Account): this;
    action(action: string): this;
    data(data: any): this;
    merge(transaction: Transaction): this;
    build(): {
        actions: any[];
    };
    execute(api: any): Promise<any>;
}
