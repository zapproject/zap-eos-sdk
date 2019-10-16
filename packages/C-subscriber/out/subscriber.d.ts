import * as Utils from "@zapjs/eos-utils";
import { SubscriberOptions } from "./types/types";
export declare class Subscriber {
    private _account;
    private _zap_account;
    private bondage;
    private arbiter;
    private dispatch;
    private tokenDotFactory;
    _node: Utils.Node;
    constructor({ account, node }: SubscriberOptions);
    connect(): Promise<void>;
    getAccount(): import("@zapjs/eos-utils/out/account").Account;
    getNode(): import("@zapjs/eos-utils/out/eosnode").Node;
    bond(provider: string, endpoint: string, amount: number): Promise<any>;
    unbond(provider: string, endpoint: string, amount: number): Promise<any>;
    queryHolders(from: number, to: number, limit: number): Promise<any>;
    buyRamBytes(amount: number): Promise<any>;
    delegateBw(net: string, cpu: string, receiver?: string): Promise<any>;
    unDelegateBw(net: string, cpu: string, receiver?: string): Promise<any>;
    handlePermission(contract: string, type: string): Promise<any>;
    subscribe(provider: string, endpoint: string, dots: number, params: string): Promise<any>;
    unsubscribe(provider: string, endpoint: string): Promise<any>;
    query(provider: string, endpoint: string, query: string, onchain_provider: boolean, timestamp: number): Promise<any>;
    cancelQuery(id: number): Promise<any>;
    tokenBond(provider: string, specifier: string, dots: number): Promise<any>;
    tokenUnBond(provider: string, specifier: string, dots: number): Promise<any>;
    getSubscriberTokens(lower_bound: number, upper_bound: number, limit: number): Promise<any>;
}
