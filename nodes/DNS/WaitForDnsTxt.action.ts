import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Resolver } from 'node:dns/promises';

export class WaitForDnsTxt extends CommonAction {
	static readonly Operation = 'waitForDnsTxt';
	static readonly Options: INodePropertyOptions = {
		name: 'Wait for DNS Text Record',
		value: WaitForDnsTxt.Operation,
		description: 'Waiting for the DNS text record to be ready',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Expected Value',
			name: 'expectedValue',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'e.g some_value',
			description: 'The expected value content in the DNS txt record',
			displayOptions: {
				show: {
					operation: [WaitForDnsTxt.Operation],
				},
			},
		},
		{
			displayName: 'Number of Successes',
			name: 'numberOfSuccesses',
			type: 'number',
			required: true,
			default: 3,
			placeholder: 'e.g 3',
			description: 'The number of consecutive successes',
			displayOptions: {
				show: {
					operation: [WaitForDnsTxt.Operation],
				},
			},
		},
		{
			displayName: 'Query Interval',
			name: 'queryInterval',
			type: 'number',
			required: true,
			default: 1,
			placeholder: 'e.g 1',
			description: 'The number of seconds between DNS queries',
			displayOptions: {
				show: {
					operation: [WaitForDnsTxt.Operation],
				},
			},
		},
		{
			displayName: 'Timeout Seconds',
			name: 'timeoutSeconds',
			type: 'number',
			required: true,
			default: 300,
			placeholder: 'e.g 300',
			description: 'The maximum waiting timeout seconds',
			displayOptions: {
				show: {
					operation: [WaitForDnsTxt.Operation],
				},
			},
		},
	];

	static canExecute(operation: string): boolean {
		return operation === WaitForDnsTxt.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const dnsServers = this.getDnsServers();
		if (dnsServers.length <= 0) throw 'At least one DNS server is required';
		const numberOfSuccesses = this.getNodeParameter<number>('numberOfSuccesses') ?? 0;
		if (numberOfSuccesses <= 0) throw 'At least one success is required';
		const timeoutSeconds = this.getNodeParameter<number>('timeoutSeconds') ?? 0;
		if (timeoutSeconds <= 0) throw 'The minimum waiting time required is one second';
		const queryInterval = this.getNodeParameter<number>('queryInterval') ?? 0;
		if (queryInterval <= 0) throw 'The minimum query interval required is one second';
		const expectedValue = this.getNodeParameter<string>('expectedValue');

		let streak = 0;
		const deadline = Date.now() + 1000 * timeoutSeconds;
		const hostName = this.getHostName();
		const resolvers = dnsServers.map((server) => {
			const resolver = new Resolver();
			resolver.setServers([server]);
			return resolver;
		});
		while (Date.now() < deadline) {
			const results = await Promise.all(
				resolvers.map((resolver) => this.resolveTxt(hostName, resolver)),
			);
			if (results.every((x) => x.includes(expectedValue))) {
				if (++streak >= numberOfSuccesses) {
					return;
				}
			} else {
				streak = 0;
			}

			await this.wait(queryInterval * 1000);
		}
		throw 'DNS propagation timeout';
	}
}
