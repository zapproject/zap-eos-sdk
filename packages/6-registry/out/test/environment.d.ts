import { Node } from '@zapjs/eos-utils';
export declare class TestNode extends Node {
    private recompile;
    private running;
    private provider;
    private zap;
    private token;
    private nodeos_path;
    private instance;
    constructor(verbose: boolean, recompile: boolean, endpoint: string, chain_id: any);
    run(): Promise<void>;
    kill(): void;
    restart(): Promise<void>;
    init(): Promise<void>;
    registerAccounts(api: any): Promise<void[]>;
    deploy(api: any): Promise<any>;
    getProvider(): import("@zapjs/eos-utils/out/account").Account;
}
