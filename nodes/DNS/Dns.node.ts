import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { QueryDnsTxt } from './QueryDnsTxt.action';
import { WaitForDnsTxt } from './WaitForDnsTxt.action';
import { CreateDnsTxtRecord } from './CreateDnsTxtRecord.action';
import { DeleteDnsTxtRecord } from './DeleteDnsTxtRecord.action';

const MANAGEMENT_OPERATIONS = [CreateDnsTxtRecord.Operation, DeleteDnsTxtRecord.Operation];

export class DNS implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DNS',
		name: 'dns',
		icon: { light: 'file:dns.svg', dark: 'file:dns.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'Query DNS records or manage them via a DNS provider API',
		documentationUrl: 'https://github.com/kboykov/n8n-nodes-acme',
		defaults: { name: 'DNS' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'cloudflareDnsApi',
				required: true,
				displayOptions: {
					show: {
						operation: MANAGEMENT_OPERATIONS,
						dnsProvider: ['cloudflare'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-options
				default: 'queryDnsTxt',
				options: [
					QueryDnsTxt.Options,
					WaitForDnsTxt.Options,
					CreateDnsTxtRecord.Options,
					DeleteDnsTxtRecord.Options,
				],
			},
			{
				displayName: 'DNS Provider',
				name: 'dnsProvider',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Cloudflare',
						value: 'cloudflare',
						description: 'Cloudflare DNS — requires an API token with Zone:DNS:Edit permission',
					},
				],
				default: 'cloudflare',
				description: 'DNS provider to use for record management',
				displayOptions: { show: { operation: MANAGEMENT_OPERATIONS } },
			},
			{
				displayName: 'Host Name',
				name: 'hostName',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. _acme-challenge.example.com',
				description: 'Host name to resolve',
				displayOptions: {
					show: { operation: [QueryDnsTxt.Operation, WaitForDnsTxt.Operation] },
				},
			},
			...QueryDnsTxt.Properties,
			...WaitForDnsTxt.Properties,
			...CreateDnsTxtRecord.Properties,
			...DeleteDnsTxtRecord.Properties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const item = items[itemIndex];
			try {
				if (QueryDnsTxt.canExecute(operation)) {
					await new QueryDnsTxt(this, item, itemIndex).execute();
				} else if (WaitForDnsTxt.canExecute(operation)) {
					await new WaitForDnsTxt(this, item, itemIndex).execute();
				} else if (CreateDnsTxtRecord.canExecute(operation)) {
					await new CreateDnsTxtRecord(this, item, itemIndex).execute();
				} else if (DeleteDnsTxtRecord.canExecute(operation)) {
					await new DeleteDnsTxtRecord(this, item, itemIndex).execute();
				}
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, { itemIndex });
				}
			}
		}

		return [items];
	}
}
