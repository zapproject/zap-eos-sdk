import * as Utils from "@zapjs/eos-utils";
import { Regsitry } from "@zapjs/eos-registry";
import { Bondage } from "@zapjs/eos-bondage";
import { Arbiter } from "@zapjs/eos-arbiter";
import { Dispatch } from "@zapjs/eos-dispatch";
import { ProviderOptions } from "./types/types";

export class Provider {
    private _account: Utils.Account;
    private _node: Utils.Node;
    _zap_account: Utils.Account;
    title: string;
    bondage: Bondage;
    arbiter: Arbiter;
    dispatch: Dispatch;
    registry: Regsitry;

    constructor({account, node}: ProviderOptions) {
        this._account = account;
        this._node = node;
        this._zap_account = node.getZapAccount();
        this.registry = new Regsitry({
            account: this._account,
            node
        });
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
        this.title = '';
    }
    async connect() {
        return await this._node.connect();
    }

    setTitle(title: string) {
      this.title = title;
    }

    getTitle() {
      return this.title;
    }

    getAccount() {
      return this._account;
    }
    getNode() {
      return this._node;
    }

    async initiateProvider(title: string, public_key: number) {
        return await this.registry.initiateProvider(title, public_key);
    }

    async addEndpoint(endpoint_specifier: string, functions: Array<number>, broker: string) {
        return await this.registry.addEndpoint(endpoint_specifier, functions, broker);
    }
    async setParams(endpoint: string, params: Array<string>) {
        return await this.registry.setParams(endpoint, params);
    }

    async queryProviderList(from: number, to: number, limit: number = -1) {
        return await this.registry.queryProviderList(from, to, limit);
    }

    async queryProviderEndpoints(from: number, to: number, limit: number = -1) {
        return await this.registry.queryProviderEndpoints(from, to, limit);
    }

    async queryIssued(from: number, to: number, limit: number) {
        return await this.bondage.queryIssued(from, to, limit);
    }

    async unsubscribeProvider(subscriber: string, endpoint: string) {
        return await this.arbiter.unsubscribeProvider(subscriber, endpoint);
    }

    async querySubscriptions(from: number, to: number, limit: number) {
        return await this.arbiter.querySubscriptions(this.getAccount().name, from, to, limit);
    }

    async respond(id: number, params: string, subscriber: string) {
        return await this.dispatch.respond(id, params, subscriber);
    }

    async queryQueriesInfo(from: number, to: number, limit: number, indexType: number) {
      return await this.dispatch.queryQueriesInfo(from, to, limit, indexType);
    }
    async queryParams(from: number, to: number, limit: number = -1, index: number) {
      return await this.registry.queryParams(from, to, limit, index)
    }

}
