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

    async buyRamBytes(amount: number) {
        return new Utils.Transaction()
        .sender(this._account)
        //@ts-ignore
        .receiver(new Account('eosio'))
        .action('buyrambytes')
        .data({
            payer: this._account.name,
            receiver: this._account.name,
            bytes: amount
        })
        .execute(this._node.api);
    }

    async handlePermission(contract: string, type: string) {
        const account = await this._node.rpc.get_account(this._account.name);
        const { accounts, keys, waits }  = JSON.parse(JSON.stringify(account.permissions)).filter((x: any) => x.perm_name === 'active')[0].required_auth;
        if(type !=='add' && type !== 'remove') return;
        if (type === 'add' && accounts.filter((x: any) => x.permission.actor == contract).length) return;            
        
        const newPermission = [{
            "permission": {
                "actor": contract,
                "permission": "eosio.code"
            },
            "weight": 1
        }];

        const newKeys = keys.length ? keys : [
            {
                "key": (await this._node.api.signatureProvider.getAvailableKeys())[0],
				"weight": 1
            }
        ];


        const data = {
			'account': this._account.name,
			'permission': 'active',
			'parent': 'owner',
			"auth": {
				"threshold": 1,
				"keys": newKeys,
				"accounts": type === 'add' ? accounts.concat(newPermission) : accounts.filter((x: any) => x.permission.actor !== contract),
                "waits": waits
            }
        }
        
        return await new Utils.Transaction()
            .sender(this._account, 'owner')
            .receiver(new Utils.Account('eosio'))
            .action('updateauth')
            .data(data)
            .execute(this._node.api);
    }
   

    async queryHolders(lower_bound: number, upper_bound: number, limit: number) {
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
