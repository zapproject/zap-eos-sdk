import { Account, Node } from '@zapjs/eos-utils';
import { Provider} from '@zapjs/eos-provider';
import { Subscriber} from '@zapjs/eos-subscriber';
import { join } from "path";
import * as readline from "readline";
const eos_ecc = require('eosjs-ecc');

const ACC_PRIV_KEY = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';

/**
 * Ask a question and receive the result in stdin
 *
 * @param question - The question to ask
 * @return A promise resolved with the answer
 */


export class TermNode extends Node {
	provider: Provider;
	subscriber: Subscriber;
	constructor(verbose: boolean, endpoint: string) {
		super({
				verbose: verbose,
				key_provider:  [ACC_PRIV_KEY],
				http_endpoint: endpoint,
				chain_id: ''
		});
		this.provider = new Provider({account:  new Account('zap.provider').usePrivateKey(ACC_PRIV_KEY), node: this});// надо по умолчанию чтоли.
		this.subscriber = new Subscriber({account: new Account('user').usePrivateKey(ACC_PRIV_KEY), node: this});
	}
  getProvider() {
		return this.provider;
	}
	getSubscriber() {
		return this.subscriber;
	}
	async loadProvider(name: string) {
		const eos = await this.connect();
		let user;
		try {
  		user = await eos.getAccount(name);
		} catch (err) {
			console.log(err);
			return false;
		}
		if (!user) return false;
		const providerAcc = new Account(user.account_name).usePrivateKey(ACC_PRIV_KEY);
		this.provider = new Provider({account: providerAcc, node: this});
		return true;
	}

	async loadSubscriber(name: string) {
		const eos = await this.connect();
		let user;
		try {
		  user = await eos.getAccount(name);
		} catch (err) {
			console.log(err);
			return false;
		}
		if (!user) return false;
		const subscriberAcc = new Account(user.account_name).usePrivateKey(ACC_PRIV_KEY);
		this.subscriber = new Subscriber({account: subscriberAcc, node: this});
		return true;
	}

	async registerProvider(name: string) {
		const eos = await this.connect();
	  let providerAcc = new Account(name).usePrivateKey(ACC_PRIV_KEY);
		try {
	    await providerAcc.register(eos);
		} catch (err) {
			console.log(err);
			return false;
		}
		this.provider = new Provider({account: providerAcc, node: this});
		return true;
	}
	async registerSubscriber(name: string) {
		const eos = await this.connect();
		let subscriberAcc = new Account(name).usePrivateKey(ACC_PRIV_KEY);
		try {
		  await subscriberAcc.register(eos);
		} catch (err) {
			console.log(err);
			return false;
		}
		this.provider = new Provider({account: subscriberAcc, node: this});
		return true;
	}
}
export function ask(question: string): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise((resolve, reject) => {
		rl.question(question, (answer: string) => {
			rl.close();
			resolve(answer);
		});
	});
}

/**
 * Promise that is resolved after a certain timeout
 *
 * @param timeout - Amount of ms to wait
 */
export function sleep(timeout: number): Promise<void> {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, timeout);
	})
}
export async function loadAccount(privateKey: string, eos: any) {
  const accounts = await eos.getKeyAccounts({public_key: eos_ecc.privateToPublic(privateKey)});
	return accounts.account_names[0];
}

export function calcDotPrice(endpoint: any, dot: number) {
	if (!endpoint.functions) return 0;
	let index = 0;
	while(index < endpoint.functions.length) {
		const len = endpoint.functions[index];
		const end = endpoint.functions[index + len + 1];

		if(dot > end) {
		// move onto the next piece
			index += len + 2;
			continue;
		}

		// calculate at this piece
		let sum = 0;
		for(let i = 0; i < len; i++){
	  	const coeff = endpoint.functions[index + i + 1];
	  	sum += coeff * Math.pow(dot, i);
	 	}

		return sum;

	}

	return -1;
}
