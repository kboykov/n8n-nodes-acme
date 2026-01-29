import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';

type ChallengeParameter = {
	domain: string;
	authorization: string;
	type: string;
	url: string;
	token?: string;
};
type OutputResult = Array<ChallengeParameter>;
export class GetChallengeKeyAuthorization extends CommonAction {
	static readonly Operation = 'getChallengeKeyAuthorization';
	static readonly Options: INodePropertyOptions = {
		name: 'Get Challenge Key Authorization',
		value: GetChallengeKeyAuthorization.Operation,
		description:
			'Obtain the challenge parameter of the specified type and generate the key authorization',
	};
	static readonly Properties: INodeProperties[] = [
		{
			displayName: 'Challenge Output Field',
			name: 'challengeOutputField',
			type: 'string',
			required: true,
			default: 'challenges',
			placeholder: 'e.g challenges',
			description: 'The name of the challenges output filed',
			displayOptions: {
				show: {
					operation: [GetChallengeKeyAuthorization.Operation],
				},
			},
		},
	];

	static canExecute(operation: string): boolean {
		return operation === GetChallengeKeyAuthorization.Operation;
	}

	constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}

	async execute(): Promise<void> {
		const challengeType = this.getChallengeType();
		const client = this.createClient();
		await client.createAccount({ termsOfServiceAgreed: true });
		const order = await this.getOrder(client);
		const authorizations = await client.getAuthorizations(order);
		const challengeParameters: ChallengeParameter[] = [];
		for (const authorization of authorizations) {
			const domain = authorization.identifier.value;
			const primaryChallenge = authorization.challenges.find((x) => challengeType === x.type);
			if (!primaryChallenge)
				throw `No ${challengeType} challenge for ${domain}, available types: ${authorization.challenges.map((x) => x.type).join(', ')}`;

			const keyAuthorization = await client.getChallengeKeyAuthorization(primaryChallenge);
			challengeParameters.push({
				domain,
				authorization: keyAuthorization,
				type: primaryChallenge.type,
				url: primaryChallenge.url,
				token: primaryChallenge.token,
			});
		}
		const challengeOutputField = this.getNodeParameter<string>('challengeOutputField');
		this.item.json[challengeOutputField] = <OutputResult>challengeParameters;
	}
}
