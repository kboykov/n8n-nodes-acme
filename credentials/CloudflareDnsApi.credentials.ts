import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CloudflareDnsApi implements ICredentialType {
	name = 'cloudflareDnsApi';
	displayName = 'Cloudflare DNS API';
	documentationUrl =
		'https://developers.cloudflare.com/fundamentals/api/get-started/create-token/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Cloudflare API token with Zone:DNS:Edit permissions. Create one at dash.cloudflare.com → My Profile → API Tokens.',
		},
	];
}
