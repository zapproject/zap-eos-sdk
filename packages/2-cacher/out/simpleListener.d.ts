export declare class SimpleEventListener {
    private _startBlock;
    private _listen;
    private _currentBlock;
    constructor(nodeosEndpoint: string, startBlock: number);
    initiate(): Promise<void>;
    listen(callback?: Function, actionName?: string): Promise<void>;
    stopListen(): void;
    static findContract(actions: Array<any>, contract?: string): any[];
}
