import * as Utils from "@zapjs/eos-utils";
import {DispatchOptions} from "./types/types";

export class Dispatch {
    _account: Utils.Account;
    _node: Utils.Node;
    _zap_account: Utils.Account;
    listenerNextQuery: any;

    constructor({account, node}: DispatchOptions) {
        this._account = account;
        this._node = node;
        this._zap_account = node.getZapAccount();
    }

    async connect() {
        return await this._node.connect();
    }

    async query(provider: string, endpoint: string, query: string, onchain_provider: boolean, timestamp: number) {
        return new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account)
            .action('query')
            .data({
                subscriber: this._account.name,
                provider: provider,
                endpoint: endpoint,
                query: query,
                onchain_provider: onchain_provider ? 1 : 0,
                onchain_subscriber: 0, // if we call it from js then it not onchain subscriber
                timestamp: timestamp
            })
            .execute(this._node.api);
    }

    async respond(id: number, params: string, subscriber: string) {
        return new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account)
            .action('respond')
            .data({
                responder: this._account.name,
                id: id,
                params: params,
                subscriber: subscriber
            })
            .execute(this._node.api);
    }

    async cancelQuery(id: number) {
        return new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account)
            .action('cancelquery')
            .data({
                subscriber: this._account.name,
                query_id: id,
            })
            .execute(this._node.api);
    }

    async queryQueriesInfo(lower_bound: number, upper_bound: number, limit: number, index_position: number) {
        return await this._node.rpc.get_table_rows({
            json: true,
            code: this._zap_account.name,
            scope: this._zap_account.name,
            table: 'qdata',
            lower_bound,
            upper_bound,
            limit,
            key_type: 'i64',
            index_position
        });
    }
}
