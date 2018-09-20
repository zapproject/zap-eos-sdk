import * as DemuxEos from "demux-eos";

export class SimpleEventListener {
    private _actionReader: DemuxEos.NodeosActionReader;
    private _startBlock: number;
    private _listen: boolean = true;
    private _currentBlock: number;

    constructor(nodeosEndpoint: string, startBlock: number) {
        this._actionReader = new DemuxEos.NodeosActionReader(nodeosEndpoint, startBlock);
        this._currentBlock = startBlock;
        this._startBlock = startBlock;
    }

    async readUntilEnd(callback?: Function, actionName?: string) {
        let latest = await this._actionReader.getHeadBlockNumber();

        while (this._currentBlock <= latest) {
            await this.readBlock(callback, actionName);
            this._currentBlock++;
        }

        return true;
    }

    async listen(callback?: Function, actionName?: string) {
        while (this._listen) {
            await this.readBlock(callback, actionName);
            this._currentBlock++;
        }
    }

    stopListen() {
        this._listen = false;
    }

    async readBlock(callback?: Function, actionName?: string) {
        let block = await this._actionReader.getBlock(this._currentBlock);

        if (block) {
            let listenedActions = SimpleEventListener.findActions(block.actions, actionName);
            if (callback && listenedActions.length > 0) {
                callback(block.blockInfo.blockNumber, listenedActions);
            }
        }

        return true;
    }

    static findActions(actions: Array<DemuxEos.EosAction>, name?: string) {
        let found = [];

        if (!name || name === '') {
            found = actions;
        } else {
            for (let i in actions) {
                if (actions[i].type === name) {
                    found.push(actions[i]);
                }
            }
        }

        return found;
    }
}