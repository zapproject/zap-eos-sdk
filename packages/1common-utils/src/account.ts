const eos_ecc = require('eosjs-ecc');

export class Account {
    _name: string;
    _default_auth: string;
    private_key: string = '';
    public_key: string = '';
    isAccount: boolean;

    constructor(account_name: string) {
        this._name = account_name;
        this._default_auth = 'active';
        this.isAccount = true;
    }

    usePrivateKey(private_key: string) {
        if (!eos_ecc.isValidPrivate(private_key)) {
            throw new Error("Private key is invalid.");
        }

        this.private_key = private_key;
        this.public_key = eos_ecc.privateToPublic(this.private_key);

        return this;
    }

    async register(eos: any) {
        return await eos.transaction((tr: any): void => {
            tr.newaccount({
                creator: 'eosio',
                name: this.name,
                owner: this.public_key,
                active: this.public_key
            });

            tr.buyrambytes({
                payer: 'eosio',
                receiver: this.name,
                bytes: 8192
            });

            tr.delegatebw({
                from: 'eosio',
                receiver: this.name,
                stake_net_quantity: '10.0000 SYS',
                stake_cpu_quantity: '10.0000 SYS',
                transfer: 0
            });
        })
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get default_auth() {
        return this._default_auth;
    }

    set default_auth(value) {
        this._default_auth = value;
    }
}