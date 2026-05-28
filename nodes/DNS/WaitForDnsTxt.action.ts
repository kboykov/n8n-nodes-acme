import type { IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Resolver } from 'node:dns/promises';

const DEFAULT_RESOLVERS = ['8.8.8.8', '1.1.1.1', '9.9.9.9'];

export class WaitForDnsTxt extends CommonAction {
	static readonly Operation = 'waitForDnsTxt';

	static readonly Options: INodePropertyOptions = {
		name: 'Wait for DNS TXT Record',
		value: WaitForDnsTxt.Operation,
		description: 'Poll until a TXT record value appears on all configured resolvers',
	};

	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Expected Value',
			name: 'expectedValue',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'e.g. abc123xyz',
			description: 'Value that must appear in the TXT record',
			displayOptions: { show: { operation: [WaitForDnsTxt.Operation] } },
		},
		{
			displayName: 'Consecutive Successes Required',
			name: 'numberOfSuccesses',
			type: 'number',
			required: true,
			default: 3,
			placeholder: 'e.g. 3',
			description:
				'Number of consecutive successful polls before the step completes (reduces false positives)',
			displayOptions: { show: { operation: [WaitForDnsTxt.Operation] } },
		},
		{
			displayName: 'Poll Interval (Seconds)',
			name: 'queryInterval',
			type: 'number',
			required: true,
			default: 5,
			placeholder: 'e.g. 5',
			description: 'Seconds between each DNS query attempt',
			displayOptions: { show: { operation: [WaitForDnsTxt.Operation] } },
		},
		{
			displayName: 'Timeout (Seconds)',
			name: 'timeoutSeconds',
			type: 'number',
			required: true,
			default: 300,
			placeholder: 'e.g. 300',
			description: 'Maximum seconds to wait before failing with a timeout error',
			displayOptions: { show: { operation: [WaitForDnsTxt.Operation] } },
		},
	];

	static canExecute(operation: string): boolean {
		return operation === WaitForDnsTxt.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const numberOfSuccesses = this.getNodeParameter<number>('numberOfSuccesses') ?? 0;
		if (numberOfSuccesses <= 0) throw 'At least one success is required';
		const timeoutSeconds = this.getNodeParameter<number>('timeoutSeconds') ?? 0;
		if (timeoutSeconds <= 0) throw 'Timeout must be at least one second';
		const queryInterval = this.getNodeParameter<number>('queryInterval') ?? 0;
		if (queryInterval <= 0) throw 'Poll interval must be at least one second';
		const expectedValue = this.getNodeParameter<string>('expectedValue');
		const hostName = this.getHostName();

		const resolvers = DEFAULT_RESOLVERS.map((server) => {
			const r = new Resolver();
			r.setServers([server]);
			return r;
		});

		let streak = 0;
		const deadline = Date.now() + 1000 * timeoutSeconds;

		while (Date.now() < deadline) {
			const results = await Promise.all(
				resolvers.map((resolver) => this.resolveTxt(hostName, resolver)),
			);
			if (results.every((x) => x.includes(expectedValue))) {
				if (++streak >= numberOfSuccesses) return;
			} else {
				streak = 0;
			}
			await this.wait(queryInterval * 1000);
		}

		throw 'DNS propagation timeout';
	}
}
