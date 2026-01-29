import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Order } from 'acme-client';

type OutputResult = Order;
export class GetOrder extends CommonAction {
	static readonly Operation = 'getOrder';
	static readonly Options: INodePropertyOptions = {
		name: 'Get Order',
		value: GetOrder.Operation,
		description: 'Obtain the detailed information of the order for applying for the certificate',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Order Output Field',
			name: 'orderDetailOutputField',
			type: 'string',
			required: true,
			default: 'order',
			placeholder: 'e.g order',
			description: 'The name of the order detail output filed',
			displayOptions: {
				show: {
					operation: [GetOrder.Operation],
				},
			},
		},
	];

	static canExecute(operation: string): boolean {
		return operation === GetOrder.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const client = this.createClient();
		const orderDetailOutputField = this.getNodeParameter<string>('orderDetailOutputField');
		await client.createAccount({ termsOfServiceAgreed: true });
		const order = await this.getOrder(client);
		this.item.json[orderDetailOutputField] = <OutputResult>order;
	}
}
