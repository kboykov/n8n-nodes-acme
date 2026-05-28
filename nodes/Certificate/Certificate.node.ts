import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { ParseCertificate } from './ParseCertificate.action';
import { GeneratePrivateKey } from './GeneratePrivateKey.action';
import { GenerateCSR } from './GenerateCSR.action';
import { ParseCSR } from './ParseCSR.action';

export class Certificate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Certificate',
		name: 'certificate',
		icon: { light: 'file:certificate.svg', dark: 'file:certificate.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'Provide common operations related to certificates',
		documentationUrl: 'https://github.com/kboykov/n8n-nodes-acme',
		defaults: {
			name: 'Certificate',
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
				options: [
					ParseCertificate.Options,
					GeneratePrivateKey.Options,
					GenerateCSR.Options,
					ParseCSR.Options,
				],
				default: ParseCertificate.Operation,
			},
			...ParseCertificate.Properties,
			...GeneratePrivateKey.Properties,
			...GenerateCSR.Properties,
			...ParseCSR.Properties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		const operation = this.getNodeParameter('operation', 0) as string;
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];

				if (ParseCertificate.canExecute(operation)) {
					const action = new ParseCertificate(this, item, itemIndex);
					await action.execute();
				}
				if (GeneratePrivateKey.canExecute(operation)) {
					const action = new GeneratePrivateKey(this, item, itemIndex);
					await action.execute();
				}
				if (GenerateCSR.canExecute(operation)) {
					const action = new GenerateCSR(this, item, itemIndex);
					await action.execute();
				}
				if (ParseCSR.canExecute(operation)) {
					const action = new ParseCSR(this, item, itemIndex);
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
