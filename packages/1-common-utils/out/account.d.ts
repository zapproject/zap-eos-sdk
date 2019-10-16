export declare class Account {
    private _name;
    private _default_auth;
    private public_key;
    isAccount: boolean;
    constructor(account_name: string);
    usePrivateKey(private_key: string): this;
    setPublicKey(key: string): void;
    register(api: any): Promise<void>;
    name: string;
    default_auth: string;
}
