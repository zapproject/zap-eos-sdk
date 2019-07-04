import {updateTransferData} from './saveToBase';

const account = process.argv[3];
export const updaters = [
  {
    actionType: "eosio.token::transfer",
    apply: updateTransferData,
  },
  {
    actionType: `${account}::addendpoint`,
    apply: updateTransferData,
  },
  {
    actionType: `${account}::newprovider`,
    apply: updateTransferData,
  },
  {
    actionType: `${account}::bond`,
    apply: updateTransferData,
  },
  {
    actionType: `${account}::unbond`,
    apply: updateTransferData,
  },
  {
    actionType: `${account}::estimate`,
    apply: updateTransferData,
  },
  {
    actionType: `${account}::query`,
    apply: updateTransferData,
  },
  {
    actionType: `${account}::cancelquery`,
    apply: updateTransferData,
  },
  {
    actionType: `${account}::respond`,
    apply: updateTransferData,
  },
  {
    actionType: `${account}::subscribe`,
    apply: updateTransferData,
  },
  {
    actionType: `${account}::unsubscribe`,
    apply: updateTransferData,
  }

];
