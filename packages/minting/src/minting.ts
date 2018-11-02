import * as Utils from "@zapjs/eos-utils";



export class tokenMinting {
    _node: Utils.Node;
    _account: Utils.Account;


    constructor(account: Utils.Account, node: Utils.Node) {
        this._node = node;
        this._account = account;
    }

    async connect() {
        return await this._node.connect();
    }
    async issueTokens(receivers: Array<{id: string, quantity: string}>, memo: string) {
        const eos = await this.connect();
        const transactions = receivers.map(account =>
             new Utils.Transaction()
                 .sender(this._account)
                 .receiver(this._account)
                 .action('issue')
                 .data({to: account.id, quantity: account.quantity, memo})
                 .execute(eos)
        );
        return Promise.all(transactions);
    }
    async transferTokens(sender: Utils.Account, receivers: Array<string>, quantity: string, memo: string) {
        const eos = await this.connect();
        const transactions = receivers.map(account =>
            new Utils.Transaction()
                .sender(sender)
                .receiver(this._account)
                .action('transfer')
                .data({from: sender.name, to: account,  quantity, memo})
                .execute(eos));

        return Promise.all(transactions);
    }
}
