import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { WaitForDnsTxt } from './WaitForDnsTxt.action';
import { QueryDnsTxt } from './QueryDnsTxt.action';

export class DNS implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DNS',
		name: 'dns',
		icon: { light: 'file:dns.svg', dark: 'file:dns.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'Provide common operations related to DNS',
		documentationUrl: 'https://github.com/colinshawn/n8n-nodes-acme.git',
		defaults: {
			name: 'DNS',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [QueryDnsTxt.Options, WaitForDnsTxt.Options],
				default: QueryDnsTxt.Operation,
			},
			{
				displayName: 'Host Name',
				name: 'hostName',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g _acme-challenge.example.com',
				description: 'The host name to be resolved',
				displayOptions: {
					show: {
						operation: [QueryDnsTxt.Operation, WaitForDnsTxt.Operation],
					},
				},
			},
			{
				displayName: 'DNS Server',
				name: 'dnsServer',
				type: 'string',
				required: true,
				default: '8.8.8.8',
				placeholder: 'e.g 8.8.8.8',
				description: 'The DNS query server used',
				displayOptions: {
					show: {
						operation: [QueryDnsTxt.Operation],
					},
				},
			},
			{
				displayName: 'DNS Servers',
				name: 'dnsServers',
				type: 'string',
				required: true,
				default: '8.8.8.8, 1.1.1.1',
				placeholder: 'e.g 8.8.8.8, 1.1.1.1',
				description: 'The DNS query server(s) used',
				displayOptions: {
					show: {
						operation: [WaitForDnsTxt.Operation],
					},
				},
			},
			...QueryDnsTxt.Properties,
			...WaitForDnsTxt.Properties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		const operation = this.getNodeParameter('operation', 0) as string;
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];

				if (QueryDnsTxt.canExecute(operation)) {
					const action = new QueryDnsTxt(this, item, itemIndex);
					await action.execute();
				}
				if (WaitForDnsTxt.canExecute(operation)) {
					const action = new WaitForDnsTxt(this, item, itemIndex);
					await action.execute();
				}
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
