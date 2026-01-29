import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { crypto } from 'acme-client';

export class GeneratePrivateKey extends CommonAction {
	static readonly Operation = 'generatePrivateKey';
	static readonly Options: INodePropertyOptions = {
		name: 'Generate Private Key',
		value: GeneratePrivateKey.Operation,
		description: 'Generate a private key',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Key Size',
			name: 'privateKeySize',
			type: 'number',
			default: 2048,
			required: true,
			placeholder: 'e.g 2048 or 4096',
			description: 'The size of the private key',
			displayOptions: {
				show: {
					operation: [GeneratePrivateKey.Operation],
				},
			},
		},
		{
			displayName: 'Binary Output Field',
			name: 'privateKeyOutputField',
			type: 'string',
			required: true,
			default: 'privateKey',
			placeholder: 'e.g privateKey',
			description: 'The name of the private key binary output filed',
			displayOptions: {
				show: {
					operation: [GeneratePrivateKey.Operation],
				},
			},
		},
	];

	static canExecute(operation: string): boolean {
		return operation === GeneratePrivateKey.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const keySize = this.getNodeParameter<number>('privateKeySize');
		if (!keySize || keySize <= 0) throw 'Key size is invalid';
		const privateKeyOutputField = this.getNodeParameter<string>('privateKeyOutputField');
		const privateKey = await crypto.createPrivateKey(keySize);
		(this.item.binary ||= {})[privateKeyOutputField] = await this.context.helpers.prepareBinaryData(
			privateKey,
			'account_key.pem',
			'application/octet-stream',
		);
	}
}
