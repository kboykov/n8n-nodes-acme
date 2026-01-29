import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { CertificateDomains, crypto } from 'acme-client';

type OutputResult = CertificateDomains;
export class ParseCSR extends CommonAction {
	static readonly Operation = 'parseCSR';
	static readonly Options: INodePropertyOptions = {
		name: 'Parse CSR',
		value: ParseCSR.Operation,
		description: 'Parse and obtain the basic information of the CSR(Certificate Signing Request)',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'CSR',
			name: 'csr',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'CSR content',
			description: 'The complete format of the CSR content',
			displayOptions: {
				show: {
					operation: [ParseCSR.Operation],
				},
			},
		},
		{
			displayName: 'Result Output Field',
			name: 'csrOutputField',
			type: 'string',
			required: true,
			default: 'csr',
			placeholder: 'e.g csr',
			description: 'The name of the CSR output filed',
			displayOptions: {
				show: {
					operation: [ParseCSR.Operation],
				},
			},
		},
	];

	static canExecute(operation: string): boolean {
		return operation === ParseCSR.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const csr = this.getNodeParameter<string>('csr');
		const csrOutputField = this.getNodeParameter<string>('csrOutputField');
		this.item.json[csrOutputField] = <OutputResult>crypto.readCsrDomains(csr);
	}
}
