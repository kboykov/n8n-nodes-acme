import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { CertificateInfo, crypto } from 'acme-client';

type OutputResult = CertificateInfo;
export class ParseCertificate extends CommonAction {
	static readonly Operation = 'parseCertificate';
	static readonly Options: INodePropertyOptions = {
		name: 'Parse Certificate',
		value: ParseCertificate.Operation,
		description: 'Parse and obtain the basic information of the certificate',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Certificate',
			name: 'certificate',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'certificate content',
			description: 'The complete format of the certificate content',
			displayOptions: {
				show: {
					operation: [ParseCertificate.Operation],
				},
			},
		},
		{
			displayName: 'Result Output Field',
			name: 'certificateOutputField',
			type: 'string',
			required: true,
			default: 'certificate',
			placeholder: 'e.g certificate',
			description: 'The name of the certificate output filed',
			displayOptions: {
				show: {
					operation: [ParseCertificate.Operation],
				},
			},
		},
	];

	static canExecute(operation: string): boolean {
		return operation === ParseCertificate.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const certificate = this.getNodeParameter<string>('certificate');
		const certificateOutputField = this.getNodeParameter<string>('certificateOutputField');
		this.item.json[certificateOutputField] = <OutputResult>crypto.readCertificateInfo(certificate);
	}
}
