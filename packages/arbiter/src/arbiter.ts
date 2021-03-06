import * as Utils from "@zapjs/eos-utils";
import {ArbiterOptions} from "./types/types";

export class Arbiter {
    _account: Utils.Account;
    _node: Utils.Node;
    _zap_account: Utils.Account;

    constructor({account, node}: ArbiterOptions) {
        this._account = account;
        this._node = node;
        this._zap_account = node.getZapAccount();
    }

    async connect() {
        return await this._node.connect();
    }

    async subscribe(provider: string, endpoint: string, dots: number, params: string) {
        let eos = await this.connect();

        return new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account)
            .action('subscribe')
            .data({
                subscriber: this._account.name,
                provider: provider,
                endpoint: endpoint,
                dots: dots,
                params: params
            })
            .execute(eos);
    }

    async unsubscribeSubscriber(provider: string, endpoint: string) {
        let eos = await this.connect();

        return new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account)
            .action('unsubscribe')
            .data({
                subscriber: this._account.name,
                provider: provider,
                endpoint: endpoint,
                from_sub: 1
            })
            .execute(eos);
    }

    async unsubscribeProvider(subscriber: string, endpoint: string) {
        let eos = await this.connect();

        return new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account)
            .action('unsubscribe')
            .data({
                subscriber: subscriber,
                provider: this._account.name,
                endpoint: endpoint,
                from_sub: 0
            })
            .execute(eos);
    }


    async querySubscriptions(provider: string, from: number, to: number, limit: number) {
        let eos = await this.connect();

        return await eos.getTableRows(
            true, // json
            this._zap_account.name, // code
            provider, // scope
            'subscription', // table name
            'id', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            1 // index position
        );
    }

}
