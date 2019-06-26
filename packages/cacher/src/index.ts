const { BaseActionWatcher } = require("demux")
const { NodeosActionReader, AbstractActionHandler } = require("demux-eos") // eslint-disable-line
import { ObjectActionHandler } from "./ObjectActionHandler";
import  { updaters }  from "./updaters";
import { effects }  from "./effects";
import { SimpleEventListener } from './simpleListener';
import {updateTransferData} from './saveToBase';

declare const process: any;

async function startDemux() {
  const handlerVersion = {
    versionName: "v1",
    updaters,
    effects,
  }

  const actionHandler = new ObjectActionHandler([handlerVersion]);
  const latest = await new NodeosActionReader({
    startAtBlock: 1,
    onlyIrreversible: false,
    nodeosEndpoint: process.argv[2]
  }).getHeadBlockNumber();
  const actionReader = new NodeosActionReader({
    startAtBlock: latest,
    onlyIrreversible: false,
    nodeosEndpoint: process.argv[2]
  })

  const actionWatcher = new BaseActionWatcher(
    actionReader,
    actionHandler,
    100,
  )
  actionWatcher.watch();
}
async function startSmallListener() {
  const list = new SimpleEventListener(process.argv[2], 1);
  await list.initiate();
  list.listen((res: any, payload: any) => updateTransferData(null, payload[0], null, null), process.argv[3]);
}

if(process.argv[5] === 'smallListener') {
  startSmallListener()
} else {
  startDemux();
}
