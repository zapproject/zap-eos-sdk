import * as Utils from "@zapjs/eos-utils";
import {ProviderOptions} from "./types/types";

export class Provider {
    _account: Utils.Account;
    _node: Utils.Node;
    _zap_account: Utils.Account;

    constructor({account, node}: ProviderOptions) {
        this._account = account;
        this._node = node;
        this._zap_account = node.getZapAccount();
    }

    async connect() {
        return await this._node.connect();
    }


}
