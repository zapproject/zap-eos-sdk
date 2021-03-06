const { BaseActionWatcher } = require("demux")
const { NodeosActionReader } = require("demux-eos") // eslint-disable-line
import { ObjectActionHandler } from "./ObjectActionHandler";
import  { updaters }  from "./updaters";
import { effects }  from "./effects";
 declare var process: any;




const actionHandler = new ObjectActionHandler(
  updaters,
  effects,
)

const actionReader = new NodeosActionReader(
process.argv[2], // Thanks EOS Calgary!
  0, // Start at most recent blocks
)

const actionWatcher = new BaseActionWatcher(
  actionReader,
  actionHandler,
  500,
)
actionWatcher.watch()
