import { BondageOptions } from "./types/types";
export declare class Bondage {
    private _account;
    private _node;
    private _zap_account;
    constructor({ account, node }: BondageOptions);
    connect(): Promise<void>;
    bond(provider: string, endpoint: string, amount: number): Promise<any>;
    unbond(provider: string, endpoint: string, amount: number): Promise<any>;
    queryHolders(lower_bound: number | string, upper_bound: number | string, limit: number): Promise<any>;
    queryIssued(lower_bound: number, upper_bound: number, limit: number): Promise<any>;
}
