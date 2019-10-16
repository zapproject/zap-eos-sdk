declare const AbstractActionHandler: any;
export default AbstractActionHandler;
export declare class ObjectActionHandler extends AbstractActionHandler {
    constructor(handlers: any);
    handleWithState(handle: any): Promise<void>;
    loadIndexState(): Promise<{
        blockNumber: number;
        blockHash: string;
        isReplay: boolean;
        handlerVersionName: string;
    }>;
    updateIndexState(stateObj: any, block: any, isReplay: any, handlerVersionName: any): Promise<void>;
    rollbackTo(blockNumber: any): Promise<void>;
    setup(): Promise<void>;
}
