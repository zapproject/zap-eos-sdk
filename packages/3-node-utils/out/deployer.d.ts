import { deployerOptions } from "./types/types";
import { Account, Transaction } from "@zapjs/eos-utils";
export declare class Deployer {
    private _api;
    private _contract_name;
    private _deployer_account?;
    private _wasm;
    private _abi;
    private _after_deploy_tr?;
    private _before_deploy_tr?;
    constructor({ api, contract_name }: deployerOptions);
    from(account: Account): this;
    abi(abi: string): this;
    wasm(wasm: string): this;
    afterDeploy(transaction: Transaction): this;
    beforeDeploy(transaction: Transaction): this;
    sleep(timeout: number): Promise<void>;
    deploy(): Promise<any>;
}
