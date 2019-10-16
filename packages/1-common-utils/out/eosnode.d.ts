import { nodeOptions } from "./types/types";
export declare class Node {
    private _zap_account;
    verbose: boolean;
    api: any;
    rpc: any;
    rpcError: any;
    testnet: string;
    constructor({ verbose, key_provider, http_endpoint, chain_id, contract, scatter }: nodeOptions);
    sleep(miliseconds: number): void;
    _waitNodeStartup(timeout: number): Promise<void>;
    connect(): Promise<void>;
    getZapAccount(): import("./account").Account;
}
