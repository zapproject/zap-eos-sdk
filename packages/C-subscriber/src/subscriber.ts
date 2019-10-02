import * as Utils from "@zapjs/eos-utils";
import { Bondage } from "@zapjs/eos-bondage";
import { Arbiter } from "@zapjs/eos-arbiter";
import { Dispatch } from "@zapjs/eos-dispatch";
import { SubscriberOptions } from "./types/types";
import { TokenDotFactory } from "@zapjs/eos-tokendotfactory";

export class Subscriber {
    private _account: Utils.Account;
    private _zap_account: Utils.Account;
    private bondage: Bondage;
    private arbiter: Arbiter;
    private dispatch: Dispatch;
    private tokenDotFactory: TokenDotFactory;
    public _node: Utils.Node;

    constructor({account, node}: SubscriberOptions) {
        this._account = account;
        this._node = node;
        this._zap_account = node.getZapAccount();
        this.bondage = new Bondage({
            account: this._account,
            node
        });
        this.arbiter = new Arbiter({
            account: this._account,
            node
        });
        this.dispatch = new Dispatch({
            account: this._account,
            node
        });
        this.tokenDotFactory = new TokenDotFactory({
            //@ts-ignore
            account: this._account,
            //@ts-ignore
            node
        });
    }

    async connect() {
        return await this._node.connect();
    }
    getAccount() {
      return this._account;
    }
    getNode() {
      return this._node;
    }

    async bond(provider: string, endpoint: string, amount: number) {
        return await this.bondage.bond(provider, endpoint, amount);
    }

    async unbond(provider: string, endpoint: string, amount: number) {
        return await this.bondage.unbond(provider, endpoint, amount);
    }

    async queryHolders(from: number, to: number, limit: number) {
        return await this.bondage.queryHolders(from, to, limit);
    }

    async buyRamBytes(amount: number) {
        return new Utils.Transaction()
        .sender(this._account)
        //@ts-ignore
        .receiver(new Utils.Account('eosio'))
        .action('buyrambytes')
        .data({
            payer: this._account.name,
            receiver: this._account.name,
            bytes: amount
        })
        .execute(this._node.api);
    }

    async delegateBw(net: string, cpu: string, receiver: string = this._account.name) {
        return new Utils.Transaction()
        .sender(this._account)
        //@ts-ignore
        .receiver(new Utils.Account('eosio'))
        .action('delegatebw')
        .data({
            from: this._account.name,
            receiver: receiver,
            stake_net_quantity: net,
            stake_cpu_quantity: cpu,
            transfer: false,
        })
        .execute(this._node.api);
    }

    async unDelegateBw(net: string, cpu: string, receiver: string = this._account.name) {
        return new Utils.Transaction()
        .sender(this._account)
        //@ts-ignore
        .receiver(new Utils.Account('eosio'))
        .action('undelegatebw')
        .data({
            from: this._account.name,
            receiver: receiver,
            unstake_net_quantity: net,
            unstake_cpu_quantity: cpu,
            transfer: false,
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
   

    async subscribe(provider: string, endpoint: string, dots: number, params: string) {
        return await this.arbiter.subscribe(provider, endpoint, dots, params);
    }

    async unsubscribe(provider: string, endpoint: string) {
        return await this.arbiter.unsubscribeSubscriber(provider, endpoint);
    }

    async query(provider: string, endpoint: string, query: string, onchain_provider: boolean, timestamp: number) {
        return await this.dispatch.query(provider, endpoint, query, onchain_provider, timestamp);
    }

    async cancelQuery(id: number)  {
        return await this.dispatch.cancelQuery(id);
    }
    async tokenBond(provider: string, specifier: string, dots: number) {
        return await this.tokenDotFactory.tokenBond(provider, specifier, dots);
    }

    async tokenUnBond(provider: string, specifier: string, dots: number) {
        return await this.tokenDotFactory.tokenUnBond(provider, specifier, dots) 
    }
    async getSubscriberTokens(lower_bound: number, upper_bound: number, limit: number) {
        return await this.tokenDotFactory.getSubscriberTokens(lower_bound, upper_bound, limit);
    }
}