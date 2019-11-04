import { RegistryOptions } from "./types/types";
export declare class Registry {
    private _account;
    private _zap_account_name;
    private _node;
    constructor({ account, node }: RegistryOptions);
    initiateProvider(title: string, public_key: number): Promise<any>;
    addEndpoint(endpoint_specifier: string, functions: Array<number>, broker: string): Promise<any>;
    setParams(endpoint: string, params: Array<string>): Promise<any>;
    queryProviderList(lower_bound: number, upper_bound: number, limit?: number): Promise<any>;
    queryParams(lower_bound: number | string, upper_bound: number | string, limit: number | undefined, index_position: number): Promise<any>;
    queryProviderEndpoints(lower_bound: number, upper_bound: number, limit?: number): Promise<any>;
}
