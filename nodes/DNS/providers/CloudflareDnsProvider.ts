import type { IDnsProvider, ProviderHttpFn, TxtRecordResult } from './IDnsProvider';

interface CloudflareResult<T> {
	success: boolean;
	errors: Array<{ code: number; message: string }>;
	result: T;
}

interface CloudflareZone {
	id: string;
	name: string;
}

interface CloudflareDnsRecord {
	id: string;
}

export class CloudflareDnsProvider implements IDnsProvider {
	private static readonly BASE = 'https://api.cloudflare.com/client/v4';

	constructor(
		private readonly apiToken: string,
		private readonly http: ProviderHttpFn,
	) {}

	private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const raw = await this.http(
			method,
			`${CloudflareDnsProvider.BASE}${path}`,
			{
				Authorization: `Bearer ${this.apiToken}`,
				'Content-Type': 'application/json',
			},
			body,
		);
		const data = raw as CloudflareResult<T>;
		if (!data.success) {
			const msg = data.errors.map((e) => `[${e.code}] ${e.message}`).join('; ');
			throw new Error(`Cloudflare API error: ${msg}`);
		}
		return data.result;
	}

	/**
	 * Walks the domain labels right-to-left to find the matching Cloudflare zone.
	 * e.g. for "_acme-challenge.sub.example.com" it will try "example.com" first.
	 */
	private async getZoneId(domain: string): Promise<string> {
		const clean = domain.replace(/\.$/, '');
		const labels = clean.split('.');
		for (let i = labels.length - 2; i >= 0; i--) {
			const candidate = labels.slice(i).join('.');
			const zones = await this.request<CloudflareZone[]>(
				'GET',
				`/zones?name=${encodeURIComponent(candidate)}&status=active`,
			);
			if (zones.length > 0) return zones[0].id;
		}
		throw new Error(`No active Cloudflare zone found for domain: ${domain}`);
	}

	async createTxtRecord(
		domain: string,
		name: string,
		value: string,
		ttl: number,
	): Promise<TxtRecordResult> {
		const zoneId = await this.getZoneId(domain);
		const record = await this.request<CloudflareDnsRecord>(
			'POST',
			`/zones/${zoneId}/dns_records`,
			{ type: 'TXT', name, content: value, ttl },
		);
		return { recordId: record.id, name, value, domain };
	}

	async deleteTxtRecord(domain: string, recordId: string): Promise<void> {
		const zoneId = await this.getZoneId(domain);
		await this.request('DELETE', `/zones/${zoneId}/dns_records/${recordId}`);
	}
}
