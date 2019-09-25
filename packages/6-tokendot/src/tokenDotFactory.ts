import * as Utils from "@zapjs/eos-utils";
import {TokenDotFactoryOptions} from "./types/types";

export class TokenDotFactory {
    private _account: Utils.Account;
    private _zap_account_name: Utils.Account;
    private _node: Utils.Node;
  
    constructor({account, node}: TokenDotFactoryOptions) {
      this._account = account;
      this._node = node;
      this._zap_account_name = node.getZapAccount();
    }
  
    public async tokenCurveInit(name: string, endpoint: string, functions: any, maximum_supply: string) {
      return await new Utils.Transaction( )
        .sender(this._account)
        .receiver(this._node.getZapAccount())
        .action('tdinit')
        .data({provider: name, specifier: endpoint, functions: functions, maximum_supply: maximum_supply})
        .execute(this._node.api)
    }
    public async tokenBond(provider: string, specifier: string, dots: number) {
        return await new Utils.Transaction( )
        .sender(this._account)
        .receiver(this._node.getZapAccount())
        .action('tdbond')
        .data({issuer: this._account.name, provider, specifier, dots})
        .execute(this._node.api)
    }
    public async tokenUnBond(provider: string, specifier: string, dots: number) {
      return await new Utils.Transaction( )
        .sender(this._account)
        .receiver(this._node.getZapAccount())
        .action('tdunbond')
        .data({issuer: this._account.name, provider, specifier, dots})
        .execute(this._node.api)
    }
    public async getTokenProviders(lower_bound: number, upper_bound: number, limit: number) {
      const {rows} = await this._node.rpc.get_table_rows({
        json: true,
        code: this._node.getZapAccount().name,
        scope: this._node.getZapAccount().name,
        table: 'fprovider',
        lower_bound,
        upper_bound,
        limit,
        key_type: 'i64',
        index_position: 1
      });
      return rows;
    }
    public async getProviderTokens(lower_bound: number, upper_bound: number, limit: number) {
      const {rows} = await this._node.rpc.get_table_rows({
        json: true,
        code:this._node.getZapAccount().name,
        scope: this._account.name,
        table: 'ftoken',
        lower_bound,
        upper_bound,
        limit,
        key_type: 'i64',
        index_position: 1
      });
      return rows;
    }
    public async getSubscriberTokens(lower_bound: number, upper_bound: number, limit: number) {
      const {rows} = await this._node.rpc.get_table_rows({
        json: true,
        code: this._node.getZapAccount().name,
        scope: this._account.name,
        table: 'accounts',
        lower_bound,
        upper_bound,
        limit,
        key_type: 'i64',
        index_position: 1
      });
      return rows;
    }
  }
