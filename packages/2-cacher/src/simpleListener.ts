const fetch = require('node-fetch');

export class SimpleEventListener {
    private _startBlock: number;
    private _listen: boolean = true;
    private _currentBlock: number;

    constructor(nodeosEndpoint: string, startBlock: number) {
        this._currentBlock = startBlock;
        this._startBlock = startBlock;
    }
    async initiate() {
        const res: any = await fetch(`${process.argv[2]}/v1/chain/get_info`);
        const {head_block_num} = await res.json();
        this._currentBlock = head_block_num
    }

    async listen(callback?: Function, actionName?: string) {
        try {
            while (this._listen) {
                const resp: any = await fetch(`${process.argv[2]}/v1/chain/get_info`);
                const {head_block_num} = await resp.json();
                const quantity = head_block_num - this._currentBlock;
                const promises = [];
                for(let i = 1; i <= quantity; i++) {
                    promises.push(
                        fetch(`${process.argv[2]}/v1/chain/get_block`, {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({"block_num_or_id": this._currentBlock + i})
                        }).then((res: any) => res.json())
                    );
                }
                const res = await Promise.all(promises);
                res.forEach((block) => {
                    if (block && block.transactions && block.transactions) {
                        block.transactions.forEach((tr: any) => {
                            if(!tr.trx || !tr.trx.transaction || !tr.trx.transaction.actions) return;
                            const listenedActions = SimpleEventListener.findContract(tr.trx.transaction.actions, actionName);
                            if (callback && listenedActions.length > 0) {
                                callback(block.block_num, {...listenedActions, transactionId: tr.trx.id});
                            }
                        })
                    }
                });
                this._currentBlock += quantity;
            }
        } catch (err) {console.log(err)}

    }

    stopListen() {
        this._listen = false;
    }
    static findContract(actions: Array<any>, contract?: string) {
        let found = [];

        if (!contract || contract === '') {
            found = actions;
        } else {
            for (let i in actions) {
                if (actions[i].account === contract) {
                    found.push(actions[i]);
                }
            }
        }

        return found;
    }
}
