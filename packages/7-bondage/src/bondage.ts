import * as Utils from "@zapjs/eos-utils";
import {BondageOptions} from "./types/types";
import { Account } from "@zapjs/eos-utils/out/account";

export class Bondage {
    private _account: Utils.Account;
    private _node: Utils.Node;
    private _zap_account: Utils.Account;

    constructor({account, node}: BondageOptions) {
        this._account = account;
        this._node = node;
        this._zap_account = node.getZapAccount();

    }

    async connect() {
        return await this._node.connect();
    }

    async bond(provider: string, endpoint: string, amount: number) {
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
            .execute(this._node.api);
    }

    async unbond(provider: string, endpoint: string, amount: number) {
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
            .execute(this._node.api);
    }

    async queryHolders(lower_bound: number | string, upper_bound: number | string, limit: number) {
        return await this._node.rpc.get_table_rows({
            json: true,
            code: this._zap_account.name,
            scope: this._account.name,
            table: 'holder',
            lower_bound,
            upper_bound,
            limit,
            key_type: 'i64',
            index_position: 3
        });
    }

    async queryIssued(lower_bound: number, upper_bound: number, limit: number) {
        return await this._node.rpc.get_table_rows({
            json: true,
            code: this._zap_account.name,
            scope: this._account.name,
            table: 'issued',
            lower_bound,
            upper_bound,
            limit,
            key_type: 'i64',
            index_position: 1
        });
    }

}
