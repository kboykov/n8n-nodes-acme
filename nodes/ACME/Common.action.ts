import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Client, Order, PrivateKeyBuffer, PrivateKeyString } from 'acme-client';
import { BaseAction } from '../../BaseAction';

export abstract class CommonAction extends BaseAction {
	protected constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	protected getAccountKey(): string {
		return this.getNodeParameter<string>('accountKey');
	}

	protected getOrderUrl(): string {
		return this.getNodeParameter<string>('orderUrl');
	}

	protected getDirectoryUrl(): string {
		return this.getNodeParameter<string>('directoryUrl');
	}

	protected getChallengeType(): string {
		return this.getNodeParameter<string>('challengeType');
	}

	protected getCsrPem(): string {
		return this.getNodeParameter<string>('csrPem');
	}

	protected createClient(accountKey?: PrivateKeyBuffer | PrivateKeyString): Client {
		accountKey ||= this.getAccountKey();
		return new Client({ accountKey, directoryUrl: this.getDirectoryUrl() });
	}

	protected getOrder(client: Client): Promise<Order> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		return client.getOrder({ url: this.getOrderUrl() });
	}
}
