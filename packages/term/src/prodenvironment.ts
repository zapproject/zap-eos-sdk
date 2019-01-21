import {Account, Node } from '@zapjs/eos-utils';
import { Subscriber } from "@zapjs/eos-subscriber";
import { Provider } from "@zapjs/eos-provider";

export class ProdNode extends Node {
	ACC_USER_PRIV_KEY: string;

	constructor(privateKey: string, verbose: boolean, endpoint: string) {
		super({
			verbose: verbose,
			key_provider: [privateKey],
			http_endpoint: endpoint,
			chain_id: ''
		});
		this.ACC_USER_PRIV_KEY = privateKey;
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
