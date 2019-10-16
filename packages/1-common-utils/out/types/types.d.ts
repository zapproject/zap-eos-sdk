export declare type nodeOptions = {
    verbose: boolean;
    key_provider?: Array<string>;
    http_endpoint: any;
    chain_id: string;
    contract: string;
    scatter?: any;
};
export declare type nodeConfig = {
    chainId: any;
    keyProvider?: Array<string>;
    scatterProvider?: any;
    httpEndpoint: string;
    expireInSeconds: number;
    broadcast: boolean;
    verbose: boolean;
    sign: boolean;
};
export declare type Message = {
    name: string;
    id: string;
    account: string;
};
