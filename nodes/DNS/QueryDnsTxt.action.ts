import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Resolver } from 'node:dns/promises';

type OutputResult = string[];

export class QueryDnsTxt extends CommonAction {
	static readonly Operation = 'queryDnsTxt';

	static readonly Options: INodePropertyOptions = {
		name: 'Query DNS TXT Record',
		value: QueryDnsTxt.Operation,
		description: 'Resolve the TXT record for a host name using standard public resolvers',
	};

	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Result Output Field',
			name: 'txtOutputField',
			type: 'string',
			required: true,
			default: 'txt',
			placeholder: 'e.g. txt',
			description: 'Output field name for the resolved TXT records array',
			displayOptions: { show: { operation: [QueryDnsTxt.Operation] } },
		},
	];

	static canExecute(operation: string): boolean {
		return operation === QueryDnsTxt.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const hostName = this.getHostName();
		const txtOutputField = this.getNodeParameter<string>('txtOutputField');
		const resolver = new Resolver();
		resolver.setServers(['8.8.8.8', '1.1.1.1']);
		const records = await this.resolveTxt(hostName, resolver, true);
		this.item.json[txtOutputField] = <OutputResult>records;
	}
}
