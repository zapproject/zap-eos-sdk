const { AbstractActionHandler } = require("demux")

// Initial state
let state = {
  volumeBySymbol: {},
  totalTransfers: 0,
  indexState: {
    blockNumber: 0,
    blockHash: "",
    isReplay: false,
    handlerVersionName: "v1",
  },
}

const stateHistory: any = {};
const stateHistoryMaxLength = 300

export default AbstractActionHandler;
export class ObjectActionHandler extends AbstractActionHandler {
  constructor(handlers: any) {
    super(handlers)
  }
  async handleWithState(handle: any) {
    await handle(state)
    const { blockNumber } = state.indexState
    stateHistory[blockNumber] = JSON.parse(JSON.stringify(state))
    if (blockNumber > stateHistoryMaxLength && stateHistory[blockNumber - stateHistoryMaxLength]) {
      delete stateHistory[blockNumber - stateHistoryMaxLength]
    }
  }

  async loadIndexState() {
    return state.indexState
  }

  async updateIndexState(stateObj: any, block: any, isReplay: any, handlerVersionName: any) {
    stateObj.indexState.blockNumber = block.blockInfo.blockNumber
    stateObj.indexState.blockHash = block.blockInfo.blockHash
    stateObj.indexState.isReplay = isReplay
    stateObj.indexState.handlerVersionName = handlerVersionName
  }

  async rollbackTo(blockNumber: any) {
    const latestBlockNumber = state.indexState.blockNumber
    const toDelete = [...Array(latestBlockNumber - (blockNumber)).keys()].map(n => n + blockNumber + 1)
    for (const n of toDelete) {
      delete stateHistory[n]
    }
    state = stateHistory[blockNumber]
  }

  async setup() {
  }
}
