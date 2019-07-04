import * as Utils from "@zapjs/eos-utils";
import {RegistryOptions} from "./types/types";

export class Registry {
    private _account: Utils.Account;
    private _zap_account_name: Utils.Account;
    private _node: Utils.Node;

    constructor({account, node}: RegistryOptions) {
        this._account = account;
        this._node = node;
        this._zap_account_name = node.getZapAccount();
    }

    async initiateProvider(title: string, public_key: number) {
        return await new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account_name)
            .action('newprovider')
            .data({provider: this._account.name, title: title, public_key: public_key})
            .execute(this._node.api);
    }

    async addEndpoint(endpoint_specifier: string, functions: Array<number>, broker: string) {
        return await new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account_name)
            .action('addendpoint')
            .data({provider: this._account.name, specifier: endpoint_specifier, functions: functions, broker: broker})
            .execute(this._node.api);
    }

    async setParams(endpoint: string, params: Array<string>) {
        return await new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account_name)
            .action('setparams')
            .data({provider: this._account.name, specifier: endpoint, params: params})
            .execute(this._node.api);
    }

    async queryProviderList(lower_bound: number, upper_bound: number, limit: number = -1) {
        return await this._node.rpc.get_table_rows({
            json: true,
            code: this._zap_account_name.name,
            scope: this._zap_account_name.name,
            table: 'provider',
            lower_bound,
            upper_bound,
            limit,
            key_type: 'i64',
            index_position: 1
        });
    }
    
    async queryParams(lower_bound: number, upper_bound: number, limit: number = -1, index_position: number) {
        return await this._node.rpc.get_table_rows({
           json:  true,
            code: this._zap_account_name.name,
            scope: this._account.name,
            table: 'params',
            lower_bound,
            upper_bound,
            limit,
            key_type: (index_position === 2) ? 'i256' : 'i64',
            index_position
        });
    }

    async queryProviderEndpoints(lower_bound: number, upper_bound: number, limit: number = -1) {
        return await this._node.rpc.get_table_rows({
            json: true,
            code: this._zap_account_name.name,
            scope: this._account.name,
            table:'endpoint',
            lower_bound,
            upper_bound,
            limit,
            key_type: 'i64',
            index_position: 1
        });
    }

}
