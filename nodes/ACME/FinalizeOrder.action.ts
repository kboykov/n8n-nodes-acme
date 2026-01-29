import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';

export class FinalizeOrder extends CommonAction {
	static readonly Operation = 'finalizeOrder';
	static readonly Options: INodePropertyOptions = {
		name: 'Finalize Order',
		value: FinalizeOrder.Operation,
		description: 'Finalize the order and obtain the certificate',
	};
	static readonly Properties: INodeProperties[] = [];

	static canExecute(operation: string): boolean {
		return operation === FinalizeOrder.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const csrPem = this.getCsrPem();
		const client = this.createClient();
		await client.createAccount({ termsOfServiceAgreed: true });
		const order = await this.getOrder(client);
		await client.finalizeOrder(order, csrPem);
	}
}
