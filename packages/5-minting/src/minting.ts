import * as Utils from "@zapjs/eos-utils";
import { Account } from "@zapjs/eos-utils/out/account";


export class tokenMinting {
    public _node: Utils.Node;
    public _account: Utils.Account;


    constructor(account: Utils.Account, node: Utils.Node) {
        this._node = node;
        this._account = account;
    }

    async connect() {
        return await this._node.connect();
    }

    async issueTokens(receivers: Array<{ id: string, quantity: string }>, memo: string) {
        const transactions = receivers.map(account =>
            new Utils.Transaction()
                .sender(this._account)
                .receiver(this._account)
                .action('issue')
                .data({to: account.id, quantity: account.quantity, memo})
                .execute(this._node.api)
        );
        return Promise.all(transactions);
    }

    async transferTokens(sender: Utils.Account, receivers: Array<string>, quantity: string, memo: string, type: string = 'EOS') {
        const transactions = receivers.map(account =>
            new Utils.Transaction()
                .sender(sender)
                .receiver(type === 'ZAP' ? this._account : new Account('eosio.token'))
                .action('transfer')
                .data({from: sender.name, to: account, quantity, memo})
                .execute(this._node.api));

        return Promise.all(transactions);
    }
}
