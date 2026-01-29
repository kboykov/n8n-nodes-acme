import { INodeProperties, INodePropertyOptions } from 'n8n-workflow/dist/esm/interfaces';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CommonAction } from './Common.action';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Challenge } from 'acme-client/types/rfc8555';
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { Authorization } from 'acme-client';

type ChallengeCombine = { challenge: Challenge; authorization: Authorization };
export class CompleteChallenge extends CommonAction {
	static readonly Operation = 'completeChallenge';
	static readonly Options: INodePropertyOptions = {
		name: 'Complete Challenge',
		value: CompleteChallenge.Operation,
		description: 'Trigger the challenge verification of the ACME server',
	};
	static readonly Properties: INodeProperties[] = [];

	static canExecute(operation: string): boolean {
		return operation === CompleteChallenge.Operation;
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
		const challenges: ChallengeCombine[] = authorizations.map((authorization) => {
			const domain = authorization.identifier.value;
			const primaryChallenge = authorization.challenges.find((x) => challengeType === x.type);
			if (!primaryChallenge)
				throw `No ${challengeType} challenge for ${domain}, available types: ${authorization.challenges.map((x) => x.type).join(', ')}`;

			return { challenge: primaryChallenge, authorization: authorization };
		});
		// trigger all challenges
		await Promise.all(challenges.map((x) => client.completeChallenge(x.challenge)));
		// wait all challenges
		await Promise.all(challenges.map((x) => client.waitForValidStatus(x.challenge)));
	}
}
