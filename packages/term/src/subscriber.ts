import { Subscriber } from "@zapjs/eos-subscriber";
import { Provider } from "@zapjs/eos-provider";
const BigNumber = require('big-number');
import { sleep, ask, calcDotsPrice} from "./util";
import { curveString } from "./curve";


export async function doBondage(user: Subscriber, node: any) {
	// Load subscriber information
	const eos = await node.connect();
	const bal = await eos.getCurrencyBalance("zap.token", user.getAccount().name, 'TST');

	console.log('You have ', bal[0]);

	// Load provider information
	const provider_name: string = await ask('Oracle (Address)> ');

	if ( provider_name.length == 0 ) {
		return;
	}

	const endpoint: string = await ask('Endpoint> ');

	const provider: Provider = await node.loadProvider(provider_name, node);

	const encodedName = new BigNumber(eos.modules.format.encodeName(provider.getAccount().name, false));

	const allHolders = await user.queryHolders(encodedName.toString(), encodedName.plus(1).toString(), 1000);
	const _bound = allHolders.rows.filter((raw: any) => raw.endpoint === endpoint);
	const bound_before = (_bound.length) ? _bound[0].dots : 0;
	const endpoints = await provider.queryProviderEndpoints(0, -1, -1);
	const endp = endpoints.rows.filter((x: any, index: any, arr: any) => {
		if(x.specifier === endpoint) {
			return true;
		}
	});
	if ( !endp.length ) {
	 	console.log('Unable to find the endpoint.');
		return;
	}

	// Get DOT information
	console.log(`You have ${bound_before} DOTs bound. How many would you like to bond?`);

	// Calculate pricing information
	const dots: number = parseInt(await ask('DOTS> '));
	const _totalBound = await provider.queryIssued(parseInt(endp[0].id), parseInt(endp[0].id) + 1, -1);
	const totalBound = (_totalBound.rows.length) ? _totalBound.rows[0].dots : 0;
	const price = await calcDotsPrice(endp[0], totalBound, dots);

	console.log(`This will require ${price.toString()} wei ZAP. Bonding ${dots} DOTs...`);

	 	if ( bal < price ) {
			console.log('Balance insufficent.');
			return;
		}
		if (dots <= 0 || isNaN(dots)) {
			console.log('Invalid value');
			return;
		}

	console.log('Bonding to the oracle...');

	const bond_txid = await user.bond(provider_name, endpoint, dots);

	console.log('Bonded to endpoint.');
	console.log(`Transaction Info: ${bond_txid.transaction_id}`);

	const allHolders_after = await user.queryHolders(encodedName.minus(1).toString(), encodedName.plus(1).toString(), 1000);
	const _bound_after = allHolders_after.rows.filter((raw: any) => raw.endpoint === endpoint);
	const bound_after = _bound_after[0].dots;
	console.log(`You now have ${bound_after} DOTs bonded.`);
}


export async function doUnbondage(user: Subscriber, node: any) {

	const provider_name: string = await ask('Oracle (Address)> ');

	if ( provider_name.length == 0 ) {
		return;
	}

	const endpoint: string = await ask('Endpoint> ');
	const eos = await node.connect();
	const provider: Provider = await node.loadProvider(provider_name, node);
	const encodedName = new BigNumber(eos.modules.format.encodeName(provider.getAccount().name, false));

	const allHolders = await user.queryHolders(encodedName.toString(), encodedName.plus(1).toString(), 1000);
	const _bound_before = allHolders.rows.filter((raw: any) => raw.endpoint === endpoint);
	const bound_before = (_bound_before.length) ? _bound_before[0].dots : -1;

	if ( bound_before === 0 ) {
		console.log('You have no DOTs bound to this provider.');
		return;
	}
	else if ( bound_before === -1 ) {
		console.log("Unable to find the endpoint");
		return;
	}

	console.log(`You have ${bound_before.toString()} DOTs bonded. How many would you like to unbond?`);

	const dots: number = parseInt(await ask('Amount> '));
	if (dots <= 0 || isNaN(dots)) {
		console.log('Invalid value');
		return;
	}
	console.log(`Unbonding ${dots} DOTs...`);

	const txid: string | any = await user.unbond( provider.getAccount().name, endpoint, dots);
	console.log(`Transaction Info: ${txid.transaction_id}`);

	const allHolders_after = await user.queryHolders(encodedName.minus(1).toString(), encodedName.plus(1).toString(), 1000);
	const _bound_after = allHolders_after.rows.filter((raw: any) => raw.endpoint === endpoint);
	const bound_after = _bound_after[0].dots;
	console.log(`You have ${bound_after.toString()} DOTs bonded.`);

	const bal = await eos.getCurrencyBalance("zap.token", user.getAccount().name, 'TST');
	console.log('You have', bal.toString());
}


export async function listOracles(provider: Provider, node: any) {
	const addresses: any = await provider.queryProviderList(0, -1, -1);
	if(Array.isArray(addresses.rows)) {
		if (addresses.length == 0) {
			console.log(`Didn't find any providers`);
			return;
		}


		const providers: any[] = await Promise.all(addresses.rows.map(async (address: any) => {
			const provider = await node.loadProvider(address.user, node);
			provider.title = address.title;
			return provider;
		}));

		// Display each one
		for (const provider of providers) {
			const endpoints = await provider.queryProviderEndpoints(0, -1, -1);

			for (const [index, endpoint] of endpoints.rows.entries()) {
				console.log(`Provider ${provider.getAccount().name}:${provider.title}/ Endpoint ${endpoint.specifier}`);
				const curve = curveString(endpoint.functions);
				console.log(`Curve: ${curve}`);
			}
		}
	} else {
		console.error("Fail to retrieve providers, unknown type")
		return;
	}
}

export async function viewInfo(user: Subscriber, provider: Provider, providerTitle: string, node: any) {

	console.log(`Name: ${user.getAccount().name}`);
	const eos = await node.connect();
	let title = providerTitle;
	let account = provider.getAccount().name;
	let endpoints = await provider.queryProviderEndpoints(0, -1, -1);
	if (providerTitle) {
		console.log(`Provider is existed in Registry:
		\nTitle: ${title},\nAccount : ${account},\nEndpoints: ${endpoints.rows.map((x: any) => x.specifier).join(', ')}`);
		} else console.log("Provider is not existed with this account");
	const bal = await eos.getCurrencyBalance("zap.token", user.getAccount().name, 'TST');
	console.log('Balance: ', bal[0]);

}
