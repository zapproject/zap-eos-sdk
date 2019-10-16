import * as Utils from "@zapjs/eos-utils";
import { ArbiterOptions } from "./types/types";
export declare class Arbiter {
    _account: Utils.Account;
    _node: Utils.Node;
    _zap_account: Utils.Account;
    constructor({ account, node }: ArbiterOptions);
    connect(): Promise<void>;
    subscribe(provider: string, endpoint: string, dots: number, params: string): Promise<any>;
    unsubscribeSubscriber(provider: string, endpoint: string): Promise<any>;
    unsubscribeProvider(subscriber: string, endpoint: string): Promise<any>;
    querySubscriptions(provider: string, lower_bound: number, upper_bound: number, limit: number): Promise<any>;
}
