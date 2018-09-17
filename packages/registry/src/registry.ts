import {Account, Node} from "@zapjs/eos-utils";
import {RegistryOptions} from "./types/types";

const Eos = require('eosjs');

export class Registry {
    _account: Account;
    _node: Node;

    constructor({account, node}: RegistryOptions) {
        this._account = account;
        this._node = node;
    }

    async connect() {
        return await this._node.connect();
    }
}
