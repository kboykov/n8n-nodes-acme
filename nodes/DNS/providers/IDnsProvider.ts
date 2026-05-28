export interface TxtRecordResult {
	recordId: string;
	name: string;
	value: string;
	domain: string;
}

/**
 * Minimal HTTP function signature passed from n8n's helpers.httpRequest.
 * Providers receive this instead of importing fetch or axios directly,
 * so all HTTP traffic flows through n8n's built-in request infrastructure.
 */
export type ProviderHttpFn = (
	method: string,
	url: string,
	headers: Record<string, string>,
	body?: unknown,
) => Promise<unknown>;

export interface IDnsProvider {
	createTxtRecord(
		domain: string,
		name: string,
		value: string,
		ttl: number,
	): Promise<TxtRecordResult>;
	deleteTxtRecord(domain: string, recordId: string): Promise<void>;
}
