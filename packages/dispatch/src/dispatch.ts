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
        let eos = await this.connect();

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
            .execute(eos);
    }

    async respond(id: number, params: string, subscriber: string) {
        let eos = await this.connect();

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
            .execute(eos);
    }

    async cancelQuery(id: number) {
        let eos = await this.connect();

        return new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account)
            .action('cancelquery')
            .data({
                subscriber: this._account.name,
                query_id: id,
            })
            .execute(eos);
    }

    async queryQueriesInfo(from: number, to: number, limit: number, indexPosition: number) {
        let eos = await this.connect();

        return await eos.getTableRows(
            true, // json
            this._zap_account.name, // code
            this._zap_account.name, // scope
            'qdata', // table name
            'id', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            indexPosition // index position
        );
    }

}
