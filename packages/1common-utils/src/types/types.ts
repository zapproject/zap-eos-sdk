export type nodeOptions = {
    verbose: boolean,
    key_provider: Array<string>,
    http_endpoint: string,
    chain_id: string,
    contract: string
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


export type Message = {
  name: string,
  id: string,
  account: string
};
