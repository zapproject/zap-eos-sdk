import { Account, Node } from '@zapjs/eos-utils';
import { Provider} from '@zapjs/eos-provider';
import { Subscriber} from '@zapjs/eos-subscriber';
import { join } from "path";
import * as readline from "readline";
const eos_ecc = require('eosjs-ecc');

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
				for(let i = 0; i < len; i++) {
						const coeff = endpoint.functions[index + i + 1];
						sum += coeff * Math.pow(dot, i);
		 		}

				return sum;

		}

		return -1;
}
