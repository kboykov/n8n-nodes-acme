import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { BaseAction } from '../../BaseAction';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Resolver } from 'node:dns/promises';

export abstract class CommonAction extends BaseAction {
	protected constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	protected getHostName(): string {
		return this.getNodeParameter<string>('hostName');
	}

	protected getDnsServer(): string {
		return this.getNodeParameter<string>('dnsServer');
	}

	protected getDnsServers(): string[] {
		return this.getNodeParameter<string>('dnsServers')
			.split(',')
			.map((x) => x.trim().toLowerCase())
			.filter((x) => x.length > 0);
	}

	protected async resolveTxt(
		hostName: string,
		resolver: Resolver,
		throwIfError: boolean = false,
	): Promise<string[]> {
		try {
			const records = await resolver.resolveTxt(hostName);
			return records.flat().map((x) => x.trim());
		} catch (e) {
			if (throwIfError) throw e;
			return [];
		}
	}
}
