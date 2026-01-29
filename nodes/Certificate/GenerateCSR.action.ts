import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { crypto, CsrOptions } from 'acme-client';

export class GenerateCSR extends CommonAction {
	static readonly Operation = 'generateCSR';
	static readonly Options: INodePropertyOptions = {
		name: 'Generate CSR',
		value: GenerateCSR.Operation,
		description: 'Generate a CSR(Certificate Signing Request)',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			default: '',
			required: true,
			description: 'The content of the private key that has been created',
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
		{
			displayName: 'Key Size',
			name: 'csrKeySize',
			type: 'number',
			default: 2048,
			required: true,
			placeholder: 'e.g 2048 or 4096',
			description: 'The size of the CSR key',
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
		{
			displayName: 'Common Name (CN)',
			name: 'commonName',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'e.g example.com',
			description:
				'The Common Name (CN) of the certificate, which is usually the main domain name applied for',
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
		{
			displayName: 'Subject Alternative Names (SAN)',
			name: 'altNames',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'e.g www.example.com, *.example.com',
			description:
				'The Subject Alternative Name (SAN) of the certificate, which is usually a list of domain names that are expected to support resolution',
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
		{
			displayName: 'Country Name (C)',
			name: 'countryName',
			type: 'string',
			default: '',
			placeholder: 'e.g CN, US',
			description:
				'The Country Name (C) of the certificate, which is usually the country/region code where the applying organization is located',
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
		{
			displayName: 'State or Province Name (ST)',
			name: 'stateName',
			type: 'string',
			default: '',
			placeholder: 'e.g Shandong, California',
			description:
				'The State or Province Name (ST) of the certificate, which is usually the name of the province or state where the applying organization is located',
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
		{
			displayName: 'Locality Name (L)',
			name: 'localityName',
			type: 'string',
			default: '',
			placeholder: 'e.g Jinan, San Francisco',
			description:
				'The Locality Name (L) of the certificate, which is usually the name of the city or region where the applying organization is located',
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
		{
			displayName: 'Organization Name (O)',
			name: 'organizationName',
			type: 'string',
			default: '',
			placeholder: 'e.g Alibaba Cloud Computing Ltd., Google LLC',
			description:
				'The Organization Name (O) of the certificate, which is usually the full name of the applying organization or company',
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
		{
			displayName: 'Organizational Unit Name (OU)',
			name: 'organizationalUnitName',
			type: 'string',
			default: '',
			placeholder: 'e.g IT Department, Security Team',
			description:
				'The Organizational Unit Name (OU) of the certificate, which is usually the department name of the applicant within the organization',
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
		{
			displayName: 'Email Address',
			name: 'emailAddress',
			type: 'string',
			default: '',
			placeholder: 'e.g contact@example.com',
			description:
				"The email address of the certificate, which usually contacts the applicant's email address",
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
		{
			displayName: 'Binary Output Field',
			name: 'csrOutputField',
			type: 'string',
			required: true,
			default: 'csr',
			placeholder: 'e.g csr',
			description: 'The name of the CSR binary output filed',
			displayOptions: {
				show: {
					operation: [GenerateCSR.Operation],
				},
			},
		},
	];

	static canExecute(operation: string): boolean {
		return operation === GenerateCSR.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const altNames = this.getNodeParameter<string>('altNames')
			.split(',')
			.map((x) => x.trim().toLowerCase())
			.filter((x) => x.length > 0);
		if (altNames.length <= 0) throw 'At least one domain name is required';

		const keySize = this.getNodeParameter<number>('csrKeySize');
		const privateKey = this.getNodeParameter<string>('privateKey');
		const commonName = this.getNodeParameter<string>('commonName');
		const country = this.getNodeParameter<string>('countryName');
		const state = this.getNodeParameter<string>('stateName');
		const locality = this.getNodeParameter<string>('localityName');
		const organization = this.getNodeParameter<string>('organizationName');
		const organizationUnit = this.getNodeParameter<string>('organizationalUnitName');
		const emailAddress = this.getNodeParameter<string>('emailAddress');
		const csrOutputField = this.getNodeParameter<string>('csrOutputField');
		const csrOptions: CsrOptions = {
			keySize,
			commonName,
			emailAddress,
			altNames,
			country,
			state,
			locality,
			organization,
			organizationUnit,
		};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_, csrPem] = await crypto.createCsr(csrOptions, privateKey);
		(this.item.binary ||= {})[csrOutputField] = await this.context.helpers.prepareBinaryData(
			csrPem,
			'certificate.csr',
			'application/octet-stream',
		);
	}
}
