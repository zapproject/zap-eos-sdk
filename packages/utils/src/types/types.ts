export type nodeOptions = {
    verbose: boolean,
    key_provider: Array<string>,
    nodeos_path: string
}

export type nodeConfig = {
    chainId: any, // 32 byte (64 char) hex string
    keyProvider: Array<string>, // WIF string or array of keys..
    httpEndpoint: string,
    expireInSeconds: number,
    broadcast: boolean,
    verbose: boolean, // API activity
    sign: boolean
};

export type deployerConfig = {
    eos: any,
    contract_name: string
}