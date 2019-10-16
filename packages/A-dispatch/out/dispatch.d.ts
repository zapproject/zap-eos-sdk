import * as Utils from "@zapjs/eos-utils";
import { DispatchOptions } from "./types/types";
export declare class Dispatch {
    _account: Utils.Account;
    _node: Utils.Node;
    _zap_account: Utils.Account;
    listenerNextQuery: any;
    constructor({ account, node }: DispatchOptions);
    connect(): Promise<void>;
    query(provider: string, endpoint: string, query: string, onchain_provider: boolean, timestamp: number): Promise<any>;
    respond(id: number, params: string, subscriber: string): Promise<any>;
    cancelQuery(id: number): Promise<any>;
    queryQueriesInfo(lower_bound: number, upper_bound: number, limit: number, index_position: number): Promise<any>;
}
