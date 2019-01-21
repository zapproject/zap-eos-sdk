#!/usr/bin/env node
import { ask, loadAccount } from "./util";
import { TestNode } from "./environment";
import { ProdNode } from "./prodenvironment";
import { Subscriber } from "@zapjs/eos-subscriber";
import { Provider } from "@zapjs/eos-provider";
import { createProviderParams, createProviderCurve, getEndpointInfo, doQuery, doResponses } from "./provider";
import { doBondage, doUnbondage, listOracles, viewInfo } from "./subscriber";
import { spawn, execSync } from 'child_process';
import * as stream from "stream";
const eos_ecc = require('eosjs-ecc');
const hdkey = require('hdkey')
const wif = require('wif')
const bip39 = require('bip39')



async function main() {
	const mnemonic = await ask("Enter you seed phrase in order to retrieve your private key>");
	const seed = bip39.mnemonicToSeedHex(mnemonic)
	const master = hdkey.fromMasterSeed(new Buffer(seed, 'hex'))
	const nodem = master.derive("m/44'/194'/0'/0/0")
	console.log("privateKey: " + wif.encode(128, nodem._privateKey, false))

	const privateKey = await ask('Enter your private key: ');
	let node;
	let endp;

	if (process.argv[2] === 'test') {
		endp = 'http://127.0.0.1:8888';
		node = new TestNode(privateKey, false, false, endp);
		await node.restart();
		await node.init();
	}
	else  {
		node = new ProdNode(privateKey, false, process.argv[2]);
		endp =  process.argv[2];
	}

	const eos = await node.connect();
	const accountName = await loadAccount(privateKey, eos);
	let provider = await node.loadProvider(accountName, node);
	let subscriber = await node.loadSubscriber(accountName, node);


	const providers: any = await provider.queryProviderList(0, -1, -1);

	const foundProvider = providers.rows.filter((row: any) => row.user === accountName);

	let providerTitle = (foundProvider.length) ? foundProvider[0].title : '';



	let subscriberTitle = subscriber.getAccount().name;
	if (providerTitle.length > 0) {
		console.log('Found provider:', providerTitle);
	}
	else {
		console.log('This account is currently not setup as a provider');
	}

	while (true) {
		console.log('What would you like to do? Type nothing to exit.');
		if (subscriberTitle == '') {
			console.log('0) Create subscriber');
		}
		else {
			console.log('0) My Info');
		}
		if (providerTitle == '') {
			console.log('1) Create provider');
		}
		else {
			console.log('1) Instantiate Bonding Curve');
		}
		console.log('2) Get Endpoint');
		console.log('3) Bond Zap');
		console.log('4) Unbond Zap');
		console.log('5) Query');

		if (providerTitle.length > 0) {
			console.log('6) Respond to Queries');
		}
		else {
			console.log('6) Respond to Queries (unavailable)')
		}

		console.log('7) List Oracles')

		const option: string = (await ask('Option> ')).trim();

		if (option == '') {
			console.log('Good bye.');
			process.exit(0);
		}
		else if (option == '0') {
			await viewInfo(subscriber, provider, providerTitle, node);
		}
		else if (option == '1') {
			if (providerTitle == '') {
				const params = await createProviderParams();
				await provider.initiateProvider(params.title, params.public_key);
				providerTitle = params.title;
				console.log(`Created ${provider.getAccount().name}: ${params.title}`)
			}
			else {
				await createProviderCurve(provider);
			}
		}
		else if (option == '2') {
			await getEndpointInfo(subscriber, node);
		}
		else if (option == '3') {
			await doBondage(subscriber, node);
		}
		else if (option == '4') {
			await doUnbondage(subscriber, node);
		}
		else if (option == '5') {
			await doQuery(subscriber, node);
		}
		else if (option == '6') {
			if (providerTitle.length > 0) {
				await doResponses(provider, node);
			}
			else {
				console.log('Unable to respond without setting up your provider first.');
			}
		}
		else if (option == '7') {
			await listOracles(provider, node);
		}
		else {
			console.error('Unknown option', option);
		}

		console.log('');
	}
}

main().then(() => { }).catch(console.error);
