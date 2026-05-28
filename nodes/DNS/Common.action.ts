import type { IExecuteFunctions, IHttpRequestMethods, INodeExecutionData } from 'n8n-workflow';
import { BaseAction } from '../../BaseAction';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Resolver } from 'node:dns/promises';
import type { IDnsProvider } from './providers/IDnsProvider';
import { CloudflareDnsProvider } from './providers/CloudflareDnsProvider';

export abstract class CommonAction extends BaseAction {
	protected constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	protected getHostName(): string {
		return this.getNodeParameter<string>('hostName');
	}

	protected async getDnsProvider(): Promise<IDnsProvider> {
		const providerName = this.getNodeParameter<string>('dnsProvider');

		switch (providerName) {
			case 'cloudflare': {
				const creds = await this.context.getCredentials('cloudflareDnsApi');
				return new CloudflareDnsProvider(
					creds.apiToken as string,
					(method, url, headers, body) =>
						this.context.helpers.httpRequest({
							method: method as IHttpRequestMethods,
							url,
							headers,
							body: body !== undefined ? JSON.stringify(body) : undefined,
						}),
				);
			}
			default:
				throw new Error(`Unsupported DNS provider: ${providerName}`);
		}
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
