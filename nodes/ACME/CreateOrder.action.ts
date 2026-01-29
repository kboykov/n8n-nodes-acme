import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { crypto, Order } from 'acme-client';

type OutputResult = Order;
export class CreateOrder extends CommonAction {
	static readonly Operation = 'createOrder';
	static readonly Options: INodePropertyOptions = {
		name: 'Create Order',
		value: CreateOrder.Operation,
		description: 'Create an order for applying for a certificate',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Order Output Field',
			name: 'orderOutputField',
			type: 'string',
			required: true,
			default: 'order',
			placeholder: 'e.g order',
			description: 'The name of the order output filed',
			displayOptions: {
				show: {
					operation: [CreateOrder.Operation],
				},
			},
		},
	];

	static canExecute(operation: string): boolean {
		return operation === CreateOrder.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const csrPem = this.getCsrPem();
		const certificateDomains = crypto.readCsrDomains(csrPem);
		const orderOutputField = this.getNodeParameter<string>('orderOutputField');
		const client = this.createClient();
		await client.createAccount({ termsOfServiceAgreed: true });
		const order = await client.createOrder({
			identifiers: certificateDomains.altNames.map((x) => ({ type: 'dns', value: x })),
		});
		this.item.json[orderOutputField] = <OutputResult>order;
	}
}
