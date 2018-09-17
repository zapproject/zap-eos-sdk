import * as Utils from "@zapjs/eos-utils";
import {RegistryOptions} from "./types/types";

export class Registry {
    _account: Utils.Account;
    _node: Utils.Node;
    _zap_account_name: Utils.Account;

    constructor({account, node}: RegistryOptions) {
        this._account = account;
        this._node = node;
        this._zap_account_name = node.getZapAccount();
    }

    async connect() {
        return await this._node.connect();
    }

    async initiateProvider(title: string, public_key: number) {
        let eos = await this.connect();

        return await new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account_name)
            .action('newprovider')
            .data({provider: this._account.name, title: title, public_key: public_key})
            .execute(eos);
    }

    async addEndpoint(endpoint_specifier: string, constants: Array<number>, parts: Array<number>, dividers: Array<number>, broker: string) {
        let eos = await this.connect();

        return await new Utils.Transaction()
            .sender(this._account)
            .receiver(this._zap_account_name)
            .action('addendpoint')
            .data({provider: this._account.name, specifier: endpoint_specifier, constants: constants, parts: parts, dividers: dividers, broker: broker})
            .execute(eos);
    }

    async queryProviderList(from: number, to: number, limit: number = -1) {
        let eos = await this.connect();

        return await eos.getTableRows(
            true, // json
            this._zap_account_name.name, // code
            this._zap_account_name.name, // scope
            'provider', // table name
            'user', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            1 // index position
        );
    }

    async queryProviderEndpoints(from: number, to: number, limit: number = -1) {
        let eos = await this.connect();

        return await eos.getTableRows(
            true, // json
            this._zap_account_name.name, // code
            this._account.name, // scope
            'endpoint', // table name
            'id', // table_key
            from, // lower_bound
            to, // upper_bound
            limit, // limit
            'i64', // key_type
            1 // index position
        );
    }

    listenNewProvider() {
        //TODO: not implemented
    }

    listenNewEndpoint() {
        //TODO: not implemented
    }
}
