import { Subscriber } from "@zapjs/eos-subscriber";
import { Provider } from "@zapjs/eos-provider";
import {ask, calcDotsPrice, sleep, getPossibleLostAnswer} from "./util";
import { createCurve, curveString } from "./curve";
import { Curve } from "@zapjs/curve";
const BigNumber = require('big-number');


export async function createProviderParams(): Promise<any> {
	console.log('Create a provider');
	const title = await ask('Title> ');
	if ( title.length == 0 ) {
		console.log('Not creating a provider now. Title cannot be empty.');
		return;
	}

	const public_key = await ask('Public Key (hex)> ');
	console.log('Creating provider...');
	return { public_key, title };
}


export async function createProviderCurve(provider: Provider): Promise<void> {
	try {
	 	const endpoint: string = await ask('Endpoint> ');
		if ( endpoint.length == 0 ) {
			return;
		}

		const curve: Curve = await createCurve();
		const broker: string = await ask('Broker> ');
		provider.addEndpoint(endpoint, curve.values, broker);
		console.log('Created endpoint', endpoint);
		} catch(err) {
			console.log('Failed to parse your input', err);
		}
}

export async function getEndpointInfo(user: Subscriber, node: any): Promise<void> {

	const provider_name: string = await ask('Oracle (Address)> ');
	if ( provider_name.length == 0 ) {
		return;
	}

	const endpoint: string = await ask('Endpoint> ');
	const eos = await node.connect();
	const provider = await node.loadProvider(provider_name, node);
	const encodedName = new BigNumber(eos.modules.format.encodeName(provider_name, false));
	const allHolders = await user.queryHolders(encodedName.toString(), encodedName.plus(1).toString(), -1);
	const bound = allHolders.rows.filter((raw: any) => raw.endpoint === endpoint);
	const endpoints = await provider.queryProviderEndpoints(0, -1, -1);
	let endpIndex = 0;
	const endp = endpoints.rows.filter((x: any) => {
		if(x.specifier === endpoint) {
			endpIndex = x.id;
	 		return true;
		}
	});
	if ( !endp.length ) {
		console.log('Unable to find the endpoint.');
		return;
	} else {
		const curve = curveString(endp[0].functions);
		const totalBound = await provider.queryIssued(endpIndex, endpIndex + 1, -1);
		if (!totalBound.rows.length ) {
			console.log('No dots issued');
			return;
		}
		const zapBound = calcDotsPrice(endp[0], 0, parseInt(totalBound.rows[0].dots));


		console.log('Curve:', curve);
		console.log('Your DOTs Bound:', bound[0].dots);
		console.log('Total DOTs:', totalBound.rows[0].dots);
		console.log('Zap Bound:', zapBound);
	}
}


export async function doQuery(user: Subscriber, node: any): Promise<void> {
	const provider_name: string = await ask('Provider name> ');

	if ( provider_name.length == 0 ) {
		return;
	}

	const endpoint: string = await ask('Endpoint> ');
	if ( endpoint.length == 0 ) {
		return;
	}

	const eos = await node.connect();
	const encodedName = new BigNumber(eos.modules.format.encodeName(provider_name, false));
	const allHolders = await user.queryHolders(encodedName.toString(), encodedName.plus(1).toString(), -1);
	const _bound = allHolders.rows.filter((raw: any) => raw.endpoint === endpoint);
	const bound = (_bound.length) ? _bound[0].dots : 0;

	if ( bound === 0 ) {
		console.log('You do not have any bound dots to this provider');
		return;
	}

	console.log(`You have ${bound} DOTs bound to this provider's endpoint. 1 DOT will be used.'`);

	let endpointParam: boolean = false;
	console.log(`Input your provider's endpoint paramaters. Enter a blank line to set FALSE.'`)
	endpointParam = !!await ask('Onchain provider> ');
	const query: string = await ask('Query> ');
	console.log('Querying provider...');
	const timestamp = Date.now();
	let transaction = await user.query(provider_name, endpoint, query, endpointParam, timestamp);
	console.log('Queried provider. Transaction Hash:', transaction.transaction_id);

	const provider = await node.loadProvider(provider_name, node);

	// Create a promise to get response
	const promise: Promise<any> = new Promise(async (resolve: any, reject: any) => {

		console.log('Waiting for response');
		let fulfilled = false;
    let id: number | undefined = undefined;
		while (typeof id === 'undefined') {
			sleep(500);
   		const res =await provider.queryQueriesInfo(timestamp, timestamp + 1, 1, 3); //timestamp, timestamp + 1
			if (res.rows.length) {
				const filtRes = res.rows.filter((x: any) => x.subscriber === user.getAccount().name);
				if(filtRes.length) {
					id = filtRes[0].id;
					const answer = await getPossibleLostAnswer(<number>id, user.getAccount().name, provider.getAccount().name, timestamp);
					if (answer) {
						fulfilled = true;
						resolve(answer);
					}
				};
			}
		}
		console.log('Query ID generated was', id);
	});

	const res = await promise;
	console.log('Response:', res);
}

export async function doResponses(provider: Provider, node: any) {

	let lastTaken: string = '';

	// Queries that need to be answered
  let queries: string[] = [];

	const nextQuery = async() => {
		const eos = await node.connect();
		const encodedName = new BigNumber(eos.modules.format.encodeName(provider.getAccount().name, false));
		encodedName.plus(1);
		return new Promise(async (resolve, reject) => {
			let fulfilled = false;
			while(!queries.length) {
				await sleep(500);
				const res = await provider.queryQueriesInfo(encodedName.minus(1).toString(), encodedName.plus(1).toString(), 10, 2);
				if (res.rows.length) queries = res.rows;
			}
			// Only call once
			if ( fulfilled ) return;
			fulfilled = true;

			resolve(queries.shift());
		});
	};

	while ( true ) {
		console.log('Waiting for the next query...');

		const data: any = await nextQuery();

		console.log(`Query [${data.endpoint}]: ${data.data}`);

		const res: string = await ask('Response> ');
		const tx: string | any = await provider.respond(data.id, res, data.subscriber);

		console.log(`Transaction Hash: ${tx.transaction_id}\n`);
	}
}
