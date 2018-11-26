import * as Utils from "@zapjs/eos-utils";
import { Bondage } from "@zapjs/eos-bondage";
import { Arbiter } from "@zapjs/eos-arbiter";
import { Dispatch } from "@zapjs/eos-dispatch";
import { SubscriberOptions } from "./types/types";

export class Subscriber {
    _account: Utils.Account;
    _node: Utils.Node;
    _zap_account: Utils.Account;
    bondage: Bondage;
    arbiter: Arbiter;
    dispatch: Dispatch;

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
            account: node.getUserAccount(),
            node
        });
    }

    async connect() {
        return await this._node.connect();
    }

    async bond(provider: string, endpoint: string, amount: number) {
        await this.bondage.bond(provider, endpoint, amount);
    }

    async unbond(provider: string, endpoint: string, amount: number) {
      await this.bondage.unbond(provider, endpoint, amount);
    }

    async queryHolders(from: number, to: number, limit: number) {
        await this.bondage.queryHolders(from, to, limit);
    }
    async subscribe(provider: string, endpoint: string, dots: number, params: string) {
        await this.bondage.subscribe(provider, endpoint, dots, params);
    }
    async unsubscribe(provider: string, endpoint: string) {
        await this.bondage.unsubscribeSubscriber(provider, endpoint);
    }
    async query(provider: string, endpoint: string, query: string, onchain_provider: boolean) {
        await this.dispatch.query(provider, endpoint, query, onchain_provider);
    }
    async cancelQuery(id: number)  {
        await this.dispatch.cancelQuery(id);
    }
    async queryQueriesInfo(from: number, to: number, limit: number) {
      await this.dispatch.queryQueriesInfo(from, to, limit);
    }

}
