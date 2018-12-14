import {Account, Node } from '@zapjs/eos-utils';
import { Subscriber } from "@zapjs/eos-subscriber";
import { Provider } from "@zapjs/eos-provider";


/*
const hdkey = require('hdkey')
const wif = require('wif')
const ecc = require('eosjs-ecc')
const bip39 = require('bip39')
const mnemonic = 'real flame win provide layer trigger soda erode upset rate beef wrist fame design merit'
const seed = bip39.mnemonicToSeedHex(mnemonic)
const master = hdkey.fromMasterSeed(Buffer(seed, 'hex'))
const node = master.derive("m/44'/194'/0'/0/0")
console.log("publicKey: "+ecc.PublicKey(node._publicKey).toString())
console.log("privateKey: "+wif.encode(128, node._privateKey, false))
*/


export class ProdNode extends Node {
	ACC_USER_PRIV_KEY: string;

	constructor(privateKey: string, verbose: boolean, endpoint: string) {
		super({
			verbose: verbose,
			key_provider: [privateKey],
			http_endpoint: endpoint,
			chain_id: ''
		});
		this.ACC_USER_PRIV_KEY = privateKey;//'5KfFufnUThaEeqsSeMPt27Poan5g8LUaEorsC1hHm1FgNJfr3sX';
	}


	async loadProvider(name: string, node: any){
		const providerAcc = new Account(name);
		providerAcc.usePrivateKey(this.ACC_USER_PRIV_KEY);
		const provider: Provider = new Provider({
			account: providerAcc,
			node
		});
		return provider;
	}
	async loadSubscriber(name: string, node: any){
		const subscriberAcc = new Account(name);
		subscriberAcc.usePrivateKey(this.ACC_USER_PRIV_KEY);
		const subscriber: Subscriber = new Subscriber({
			account: subscriberAcc,
			node
		});
		return subscriber;
	}
}
