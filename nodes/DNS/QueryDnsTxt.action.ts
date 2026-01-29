import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Resolver } from 'node:dns/promises';

type OutputResult = string[];
export class QueryDnsTxt extends CommonAction {
	static readonly Operation = 'queryDnsTxt';
	static readonly Options: INodePropertyOptions = {
		name: 'Query DNS Text Record',
		value: QueryDnsTxt.Operation,
		description: 'Query the text record of the specified host name',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Result Output Field',
			name: 'txtOutputField',
			type: 'string',
			required: true,
			default: 'txt',
			placeholder: 'e.g txt',
			description: 'The name of the text record output filed',
			displayOptions: {
				show: {
					operation: [QueryDnsTxt.Operation],
				},
			},
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
		const dnsServer = this.getDnsServer();
		const txtOutputField = this.getNodeParameter<string>('txtOutputField');
		const resolver = new Resolver();
		resolver.setServers([dnsServer]);
		const records = await this.resolveTxt(hostName, resolver, true);
		this.item.json[txtOutputField] = <OutputResult>records;
	}
}
