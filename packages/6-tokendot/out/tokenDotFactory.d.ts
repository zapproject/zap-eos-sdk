import { TokenDotFactoryOptions } from "./types/types";
export declare class TokenDotFactory {
    private _account;
    private _zap_account_name;
    private _node;
    constructor({ account, node }: TokenDotFactoryOptions);
    tokenCurveInit(name: string, endpoint: string, functions: any, maximum_supply: string): Promise<any>;
    tokenBond(provider: string, specifier: string, dots: number): Promise<any>;
    tokenUnBond(provider: string, specifier: string, dots: number): Promise<any>;
    getTokenProviders(lower_bound: number, upper_bound: number, limit: number): Promise<any>;
    getProviderTokens(lower_bound: number, upper_bound: number, limit: number): Promise<any>;
    getSubscriberTokens(lower_bound: number, upper_bound: number, limit: number): Promise<any>;
}
