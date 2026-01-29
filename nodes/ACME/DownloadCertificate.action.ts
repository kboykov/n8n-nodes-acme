import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';

type OutputResult = string;
export class DownloadCertificate extends CommonAction {
	static readonly Operation = 'downloadCertificate';
	static readonly Options: INodePropertyOptions = {
		name: 'Download Certificate',
		value: DownloadCertificate.Operation,
		description: 'Download the certificate content of the specified order',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Certificate Output Field',
			name: 'certificateOutputField',
			type: 'string',
			required: true,
			default: 'certificate',
			placeholder: 'e.g certificate',
			description: 'The name of the certificate content output filed',
			displayOptions: {
				show: {
					operation: [DownloadCertificate.Operation],
				},
			},
		},
	];

	static canExecute(operation: string): boolean {
		return operation === DownloadCertificate.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const certificateOutputField = this.getNodeParameter<string>('certificateOutputField');
		const client = this.createClient();
		await client.createAccount({ termsOfServiceAgreed: true });
		const order = await this.getOrder(client);
		const certificate = await client.getCertificate(order);
		this.item.json[certificateOutputField] = <OutputResult>certificate;
	}
}
