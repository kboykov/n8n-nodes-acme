import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';

type OutputResult = { status: string };
export class CreateAccount extends CommonAction {
	static readonly Operation = 'createAccount';
	static readonly Options: INodePropertyOptions = {
		name: 'Create Account',
		value: CreateAccount.Operation,
		description: 'Generate a new account key and register this user with directory',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Contact Mail',
			name: 'contactMail',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'e.g contact@example.com',
			description: 'The contact email address for creating for an account',
			displayOptions: {
				show: {
					operation: [CreateAccount.Operation],
				},
			},
		},
		{
			displayName: 'Account Output Field',
			name: 'accountOutputField',
			type: 'string',
			required: true,
			default: 'account',
			placeholder: 'e.g account',
			description: 'The name of the account output filed',
			displayOptions: {
				show: {
					operation: [CreateAccount.Operation],
				},
			},
		},
	];

	static canExecute(operation: string): boolean {
		return operation === CreateAccount.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const accountKey = this.getAccountKey();
		const contactMail = this.getNodeParameter<string>('contactMail');
		const accountOutputField = this.getNodeParameter<string>('accountOutputField');
		const client = this.createClient(accountKey);
		const account = await client.createAccount({
			termsOfServiceAgreed: true,
			contact: [`mailto:${contactMail}`],
		});
		this.item.json[accountOutputField] = <OutputResult>{ status: account.status };
	}
}
