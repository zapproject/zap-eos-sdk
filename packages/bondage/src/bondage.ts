import * as Utils from "@zapjs/eos-utils";
import {BondageOptions} from "./types/types";

export class Bondage {
    _account: Utils.Account;
    _node: Utils.Node;
    _zap_account: Utils.Account;

    constructor({account, node}: BondageOptions) {
        this._account = account;
        this._node = node;
        this._zap_account = node.getZapAccount();
    }

    async connect() {
        return await this._node.connect();
    }

    async bond(provider: string, endpoint: string, amount: number) {
        let eos = await this.connect();

        return new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account)
            .action('bond')
            .data({
                subscriber: this._account.name,
                provider: provider,
                endpoint: endpoint,
                dots: amount
            })
            .execute(eos);
    }

    async unbond(provider: string, endpoint: string, amount: number) {
        let eos = await this.connect();

        return new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account)
            .action('unbond')
            .data({
                subscriber: this._account.name,
                provider: provider,
                endpoint: endpoint,
                dots: amount
            })
            .execute(eos);
    }

    async queryHolders(from: number, to: number, limit: number) {
        let eos = await this.connect();

        return await eos.getTableRows(
            true, // json
            this._zap_account.name, // code
            this._account.name, // scope
            'holder', // table name
            'provider', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            1 // index position
        );
    }

    async queryIssued(from: number, to: number, limit: number) {
        let eos = await this.connect();

        return await eos.getTableRows(
            true, // json
            this._zap_account.name, // code
            this._account.name, // scope
            'issued', // table name
            'endpointid', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            1 // index position
        );
    }

    listenBond(callback?: Function) {
        let listener = new Utils.SimpleEventListener(this._node.eos_config.httpEndpoint, 1)
        listener.listen(callback, this._node.getZapAccount().name + '::bond');

        return listener;
    }

    listenUnbond(callback?: Function) {
        let listener = new Utils.SimpleEventListener(this._node.eos_config.httpEndpoint, 1)
        listener.listen(callback, this._node.getZapAccount().name + '::unbond');

        return listener;
    }
}
