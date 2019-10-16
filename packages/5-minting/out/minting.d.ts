import * as Utils from "@zapjs/eos-utils";
export declare class tokenMinting {
    _node: Utils.Node;
    _account: Utils.Account;
    constructor(account: Utils.Account, node: Utils.Node);
    connect(): Promise<void>;
    issueTokens(receivers: Array<{
        id: string;
        quantity: string;
    }>, memo: string): Promise<any[]>;
    transferTokens(sender: Utils.Account, receivers: Array<string>, quantity: string, memo: string, type?: string): Promise<any[]>;
}
