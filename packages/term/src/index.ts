#!/usr/bin/env node
import { ask, loadAccount, loadAccount2} from "./util";
import {TestNode as Node} from "./environment";
import { Subscriber } from "@zapjs/eos-subscriber";
import { Provider } from "@zapjs/eos-provider";
import { createProviderParams, createProviderCurve, getEndpointInfo, doQuery, doResponses } from "./provider";
import { createSubscriberParams, doBondage, doUnbondage, listOracles, viewInfo } from "./subscriber";
import { spawn, execSync } from 'child_process';
import * as stream from "stream";



async function main() {
  const node = new Node(false, false, 'http://127.0.0.1:8888');
// Get the provider and contracts
  await node.restart();
  await node.init();
  await node.connect();
  let provider = new Provider({
    account: node.getProviderAccount(),
    node
  });
  const subscriber  = new Subscriber({
    account: node.getUserAccount(),
    node
  });
  await provider.initiateProvider('tests', 10);


  let providerTitle = provider._account.name;
	let subscriberTitle = subscriber._account.name;
	if (providerTitle.length > 0) {
		console.log('Found provider:', providerTitle);
	}
	else {
		console.log('This account is currently not setup as a provider');
	}

	while ( true ) {
		console.log('What would you like to do? Type nothing to exit.');
		if ( subscriberTitle == '' ) {
			console.log('0) Create subscriber');
		}
		else {
			console.log('0) My Info');
		}
		if ( providerTitle == '' ) {
			console.log('1) Create provider');
		}
		else {
			console.log('1) Instantiate Bonding Curve');
		}

		if (subscriberTitle.length > 0) {
		  console.log('2) Get Endpoint');
		  console.log('3) Bond Zap');
		  console.log('4) Unbond Zap');
		  console.log('5) Query');
		}

		if ( providerTitle.length > 0 && subscriberTitle.length > 0) {
			console.log('6) Respond to Queries');
		}
		else if ( providerTitle.length > 0 && subscriberTitle.length <= 0) {
			console.log('2) Respond to Queries');
		}
		else {
			console.log('6) Respond to Queries (unavailable)')
		}

		if (subscriberTitle.length > 0) console.log('7) List Oracles')

		const option: string = (await ask('Option> ')).trim();

		if ( option == '' ) {
			console.log('Good bye.');
			process.exit(0);
		}
		else if ( option == '0' ) {
			if ( subscriberTitle == '' ) {
				const title =  await createSubscriberParams();
        await node.registerSubscriber(title);
        provider = new Provider({
          account: node.getProviderAccount(),
          node
        });
				subscriberTitle = await provider._account.name;
			}
			else {
			  await viewInfo(subscriber, node);
			}
		}
		else if ( option == '1' ) {
			if ( providerTitle == '' ) {
				const params =  await createProviderParams();
				await node.registerProvider(params.title);
        provider = new Provider({
          account: node.getProviderAccount(),
          node
        });
				await provider.initiateProvider(params.title, params.public_key);
				providerTitle = await provider._account.name;
			}
			else {
				await createProviderCurve(provider);
			}
		}
		else if ( option == '2' ) {
			await getEndpointInfo(subscriber, node);
		}
		else if ( option == '3' ) {
			await doBondage(subscriber, node);
		}
		else if ( option == '4' ) {
			await doUnbondage(subscriber, node);
		}
		else if ( option == '5' ) {
			await doQuery(subscriber, node);
		}
		else if ( option == '6' ) {
			if ( providerTitle.length > 0 ) {
				await doResponses(provider);
			}
			else {
				console.log('Unable to respond without setting up your provider first.');
			}
		}
		else if ( option == '7' ) {
			await listOracles(provider, node);
		}
    else if ( option == '8' ) {
			const params =  await createProviderParams();
			await node.registerProvider(params.title);
      provider = new Provider({
        account: node.getProviderAccount(),
        node
      });
			await provider.initiateProvider(params.title, params.public_key);
			providerTitle = await provider._account.name;
		}
    else if ( option == '9' ) {
			const title =  await createSubscriberParams();
      await node.registerSubscriber(title);
      provider = new Provider({
        account: node.getProviderAccount(),
        node
      });
			subscriberTitle = await provider._account.name;
		}
		else {
			console.error('Unknown option', option);
		}

		console.log('');
	}
}


main().then(() => {}).catch(console.error);
