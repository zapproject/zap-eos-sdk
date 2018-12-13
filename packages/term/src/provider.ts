import { Subscriber } from "@zapjs/eos-subscriber";
import { Provider } from "@zapjs/eos-provider";
import { DemuxEventListener } from "@zapjs/eos-utils";
import {ask, calcDotPrice, sleep} from "./util";
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
		const endpoint_params: number[] = [];
		console.log('Give the params for the endpoint. Give an empty one to continue.');
		const endpoint_param: string = await ask('Endpoint Param> ');
		const _enpoint_params = endpoint_param.split(' ');
		_enpoint_params.forEach(param => endpoint_params.push(parseInt(param)));
		const broker: string = await ask('Broker> ');
		provider.addEndpoint(endpoint, endpoint_params, broker);
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
	const endp = endpoints.rows.filter((x: any, index: any, arr: any) => {
		if(x.specifier === endpoint) {
			endpIndex = index;
	 		return true;
		}
	});
	if ( !endp.length ) {
		console.log('Unable to find the endpoint.');
		return;
	} else {
		const curve = calcDotPrice(endp[0], 1);
		const totalBound =	await provider.queryIssued(endpIndex, endpIndex + 1, -1);
		if (!totalBound.rows.length ) {
			console.log('No dots issued');
			return;
		}
		const zapBound = calcDotPrice(endp[0], parseInt(totalBound.rows[0].dots));


		console.log('Curve:', curve);
		console.log('Your DOTs Bound:', bound[0].dots);
		console.log('Total DOTs:', totalBound.rows[0].dots);
		console.log('Zap Bound:', zapBound);
	}
}


export async function doQuery(user: Subscriber, node: any): Promise<void> {
//	console.log(await DemuxEventListener.getAnswers(user._account.name));
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
	const timestamp = parseInt(Date.now().toString().substring(3));
	let transaction = await user.query(provider_name, endpoint, query, endpointParam, timestamp);
	console.log('Queried provider. Transaction Hash:', transaction.transaction_id);
	eos.getActions('zap.main').then((res: any) => console.log(JSON.stringify(res)))



	const provider = await node.loadProvider(provider_name, node);


		// Create a promise to get response
	const promise: Promise<any> = new Promise(async (resolve: any, reject: any) => {

		console.log('Waiting for response');
		let fulfilled = false;
    let id: number | undefined = undefined;
		while (typeof id === 'undefined') {
			sleep(500);
   		const res =await provider.queryQueriesInfo(0, -1, -1, 3); //timestamp, timestamp + 1
			if (res.rows.length) {
				const filtRes = res.rows.filter((x: any) => x.subscriber === user._account.name);
				if(filtRes.length) id = filtRes[0].id;
			}
		}
		console.log('Query ID generate was', id);
		resolve("ok");

		// Get the off chain response
		user.listenResponses(async (err: any, res: any) => {
		  resolve("ok");
			return;

		// Only call once
			if ( fulfilled ) return;
			fulfilled = true;

			// Output response
			if (res[0].data.provider === provider_name && res[0].data.subscriber === user._account.name) {
				try {
					const res = await DemuxEventListener.getAnswer(user._account.name, timestamp);
					resolve(res.answer);
				} catch(err) { reject(err); }
			}
		});
	});
	const res = await promise;
	console.log('Response', res);
}

export async function doResponses(provider: Provider, node: any) {

	let lastTaken: string = '';
	// Queries that need to be answered
	const unanswered: any[] = [];
  let queries: string[] = [];

	const nextQuery = async() => {
		const eos = await node.connect();
		const encodedName = new BigNumber(eos.modules.format.encodeName(provider._account.name, false));
		return new Promise(async (resolve, reject) => {
			let fulfilled = false;
			while(!queries.length) {
				sleep(500);
				queries = (await provider.queryQueriesInfo(encodedName.toString(), encodedName.plus(1).toString(), 10, 2)).rows;
			}
			// Only call once
			if ( fulfilled ) return;
			fulfilled = true;

			// Output response
			resolve(queries.shift());
		});
	};

	while ( true ) {
		console.log('Waiting for the next query...');

		const data: any = await nextQuery();

		console.log(`Query [${data.endpoint}]: ${data.data}`);

		const res: string = await ask('Response> ');
    await DemuxEventListener.updateQuery(data.subscriber, data.timestamp, res);
		const tx: string | any = await provider.respond(data.id, res, data.subscriber);

		console.log(`Transaction Hash: ${tx.transactionId}\n`);
	}
}
