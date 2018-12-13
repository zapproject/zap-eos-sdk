#!/usr/bin/env node
import { ask, loadAccount } from "./util";
import { TestNode as Node } from "./environment";
import { Subscriber } from "@zapjs/eos-subscriber";
import { Provider } from "@zapjs/eos-provider";
import { DemuxEventListener } from "@zapjs/eos-utils";
import { createProviderParams, createProviderCurve, getEndpointInfo, doQuery, doResponses } from "./provider";
import { doBondage, doUnbondage, listOracles, viewInfo } from "./subscriber";
import { spawn, execSync } from 'child_process';
import * as stream from "stream";
const eos_ecc = require('eosjs-ecc');



async function main() {

	const privateKey = await ask('Enter your private key: ');
	const node = new Node(privateKey, false, false, 'http://127.0.0.1:8888');

	// Get the provider and contracts
	await node.restart();
	await node.init();
	const eos = await node.connect();
	DemuxEventListener.start();
	const accountName = await loadAccount(privateKey, eos);
	//const mnemonic = await ask('Whats your mnemonic (empty entry will use blank mnemonic): ');
	let provider = await node.loadProvider(accountName, node);
	let subscriber = await node.loadSubscriber(accountName, node);


	const providers: any = await provider.queryProviderList(0, -1, -1);

	const foundProvider = providers.rows.filter((row: any) => row.user === accountName);

	let providerTitle = (foundProvider.length) ? foundProvider[0].title : '';



	let subscriberTitle = subscriber._account.name;
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
				console.log(`Created ${provider._account.name}: ${params.title}`)
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
