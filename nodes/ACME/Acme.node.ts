import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { directory } from 'acme-client';
import { CreateAccount } from './CreateAccount.action';
import { GetChallengeKeyAuthorization } from './GetChallengeKeyAuthorization.action';
import { CreateOrder } from './CreateOrder.action';
import { CompleteChallenge } from './CompleteChallenge.action';
import { GetOrder } from './GetOrder.action';
import { FinalizeOrder } from './FinalizeOrder.action';
import { DownloadCertificate } from './DownloadCertificate.action';

export enum ChallengeTypes {
	DNS = 'dns-01',
	HTTP = 'http-01',
}
export class ACME implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ACME',
		name: 'acme',
		icon: { light: 'file:acme.svg', dark: 'file:acme.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'Provide common operations of ACME(Automatic Certificate Management Environment).',
		documentationUrl: 'https://github.com/kboykov/n8n-nodes-acme',
		defaults: {
			name: 'ACME',
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
				// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-options
				default: 'createAccount',
				options: [
					CreateAccount.Options,
					CreateOrder.Options,
					GetOrder.Options,
					GetChallengeKeyAuthorization.Options,
					CompleteChallenge.Options,
					FinalizeOrder.Options,
					DownloadCertificate.Options,
				],
			},
			{
				displayName: 'Directory Url',
				name: 'directoryUrl',
				type: 'options',
				required: true,
				default: 'https://acme-staging-v02.api.letsencrypt.org/directory',
				options: [
					{
						name: "Staging (Let's Encrypt)",
						value: directory.letsencrypt.staging,
					},
					{
						name: "Production (Let's Encrypt)",
						value: directory.letsencrypt.production,
					},
				],
				description: 'Select a directory endpoint',
				displayOptions: {
					show: {
						operation: [
							CreateAccount.Operation,
							CreateOrder.Operation,
							GetOrder.Operation,
							GetChallengeKeyAuthorization.Operation,
							CompleteChallenge.Operation,
							FinalizeOrder.Operation,
							DownloadCertificate.Operation,
						],
					},
				},
			},
			{
				displayName: 'Account Key',
				name: 'accountKey',
				type: 'string',
				default: '',
				required: true,
				description: 'The content of the account key that has been created',
				displayOptions: {
					show: {
						operation: [
							CreateAccount.Operation,
							CreateOrder.Operation,
							GetOrder.Operation,
							GetChallengeKeyAuthorization.Operation,
							CompleteChallenge.Operation,
							FinalizeOrder.Operation,
							DownloadCertificate.Operation,
						],
					},
				},
			},
			{
				displayName: 'Order Url',
				name: 'orderUrl',
				type: 'string',
				default: '',
				required: true,
				description: 'The URL of the already created order',
				displayOptions: {
					show: {
						operation: [
							GetOrder.Operation,
							GetChallengeKeyAuthorization.Operation,
							CompleteChallenge.Operation,
							FinalizeOrder.Operation,
							DownloadCertificate.Operation,
						],
					},
				},
			},
			{
				displayName: 'CSR',
				name: 'csrPem',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'CSR content',
				description: 'The complete format of the CSR content',
				displayOptions: {
					show: {
						operation: [CreateOrder.Operation, FinalizeOrder.Operation],
					},
				},
			},
			{
				displayName: 'Challenge Type',
				name: 'challengeType',
				type: 'options',
				required: true,
				default: 'dns-01',
				options: [
					{
						name: 'DNS-01',
						value: ChallengeTypes.DNS,
					},
					{
						name: 'HTTP-01',
						value: ChallengeTypes.HTTP,
					},
				],
				description: 'Select a challenge type',
				displayOptions: {
					show: {
						operation: [GetChallengeKeyAuthorization.Operation, CompleteChallenge.Operation],
					},
				},
			},
			...CreateAccount.Properties,
			...CreateOrder.Properties,
			...GetOrder.Properties,
			...GetChallengeKeyAuthorization.Properties,
			...CompleteChallenge.Properties,
			...FinalizeOrder.Properties,
			...DownloadCertificate.Properties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		const operation = this.getNodeParameter('operation', 0) as string;
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];
				if (CreateAccount.canExecute(operation)) {
					const action = new CreateAccount(this, item, itemIndex);
					await action.execute();
				}
				if (CreateOrder.canExecute(operation)) {
					const action = new CreateOrder(this, item, itemIndex);
					await action.execute();
				}
				if (GetOrder.canExecute(operation)) {
					const action = new GetOrder(this, item, itemIndex);
					await action.execute();
				}
				if (GetChallengeKeyAuthorization.canExecute(operation)) {
					const action = new GetChallengeKeyAuthorization(this, item, itemIndex);
					await action.execute();
				}
				if (CompleteChallenge.canExecute(operation)) {
					const action = new CompleteChallenge(this, item, itemIndex);
					await action.execute();
				}
				if (FinalizeOrder.canExecute(operation)) {
					const action = new FinalizeOrder(this, item, itemIndex);
					await action.execute();
				}
				if (DownloadCertificate.canExecute(operation)) {
					const action = new DownloadCertificate(this, item, itemIndex);
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
