import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';

export class CreateDnsTxtRecord extends CommonAction {
	static readonly Operation = 'createDnsTxtRecord';

	static readonly Options: INodePropertyOptions = {
		name: 'Create DNS TXT Record',
		value: CreateDnsTxtRecord.Operation,
		description: 'Create a TXT record via a DNS provider API',
	};

	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Domain (Zone)',
			name: 'domain',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'e.g. example.com',
			description:
				'Root zone name as it appears in your DNS provider (e.g. example.com, not sub.example.com)',
			displayOptions: { show: { operation: [CreateDnsTxtRecord.Operation] } },
		},
		{
			displayName: 'Record Name',
			name: 'recordName',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'e.g. _acme-challenge.example.com',
			description: 'Full DNS record name to create',
			displayOptions: { show: { operation: [CreateDnsTxtRecord.Operation] } },
		},
		{
			displayName: 'Record Value',
			name: 'recordValue',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'e.g. abc123xyz_key_authorization',
			description: 'TXT record content — for ACME DNS-01 use the key authorization value',
			displayOptions: { show: { operation: [CreateDnsTxtRecord.Operation] } },
		},
		{
			displayName: 'TTL (Seconds)',
			name: 'ttl',
			type: 'number',
			default: 120,
			placeholder: 'e.g. 120',
			description: 'Time-to-live in seconds. Use 1 for automatic/provider default.',
			displayOptions: { show: { operation: [CreateDnsTxtRecord.Operation] } },
		},
		{
			displayName: 'Record ID Output Field',
			name: 'recordIdOutputField',
			type: 'string',
			required: true,
			default: 'dnsRecordId',
			description:
				'Output field to store the created record ID — pass this to Delete DNS TXT Record later',
			displayOptions: { show: { operation: [CreateDnsTxtRecord.Operation] } },
		},
	];

	static canExecute(operation: string): boolean {
		return operation === CreateDnsTxtRecord.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const provider = await this.getDnsProvider();
		const domain = this.getNodeParameter<string>('domain');
		const recordName = this.getNodeParameter<string>('recordName');
		const recordValue = this.getNodeParameter<string>('recordValue');
		const ttl = this.getNodeParameter<number>('ttl');
		const recordIdOutputField = this.getNodeParameter<string>('recordIdOutputField');

		const result = await provider.createTxtRecord(domain, recordName, recordValue, ttl);
		this.item.json[recordIdOutputField] = result.recordId;
		this.item.json['dnsRecord'] = result;
	}
}
