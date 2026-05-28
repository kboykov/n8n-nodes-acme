import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';

export class DeleteDnsTxtRecord extends CommonAction {
	static readonly Operation = 'deleteDnsTxtRecord';

	static readonly Options: INodePropertyOptions = {
		name: 'Delete DNS TXT Record',
		value: DeleteDnsTxtRecord.Operation,
		description: 'Delete a TXT record via a DNS provider API',
	};

	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Domain (Zone)',
			name: 'domain',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'e.g. example.com',
			description: 'Root zone name — must match the domain used when creating the record',
			displayOptions: { show: { operation: [DeleteDnsTxtRecord.Operation] } },
		},
		{
			displayName: 'Record ID',
			name: 'recordId',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'e.g. {{ $json.dnsRecordId }}',
			description:
				'The provider record ID returned by Create DNS TXT Record (stored in dnsRecordId by default)',
			displayOptions: { show: { operation: [DeleteDnsTxtRecord.Operation] } },
		},
	];

	static canExecute(operation: string): boolean {
		return operation === DeleteDnsTxtRecord.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const provider = await this.getDnsProvider();
		const domain = this.getNodeParameter<string>('domain');
		const recordId = this.getNodeParameter<string>('recordId');
		await provider.deleteTxtRecord(domain, recordId);
		this.item.json['deleted'] = true;
		this.item.json['recordId'] = recordId;
	}
}
