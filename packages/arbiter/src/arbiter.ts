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
            .execute(this._node.api);
    }

    async unsubscribeSubscriber(provider: string, endpoint: string) {
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
            .execute(this._node.api);
    }

    async unsubscribeProvider(subscriber: string, endpoint: string) {
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
            .execute(this._node.api);
    }


    async querySubscriptions(provider: string, lower_bound: number, upper_bound: number, limit: number) {
        return await this._node.rpc.get_table_rows({
            json: true,
            code: this._zap_account.name,
            provider,
            table: 'subscription',
            lower_bound,
            upper_bound,
            limit,
            key_type: 'i64',
            index_position: 1
        });
    }

}
