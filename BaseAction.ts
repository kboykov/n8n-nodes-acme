import type { IExecuteFunctions, INode, INodeExecutionData } from 'n8n-workflow';

export abstract class BaseAction {
	protected readonly context: IExecuteFunctions;
	protected readonly item: INodeExecutionData;
	protected readonly itemIndex: number;

	protected constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		this.context = context;
		this.item = item;
		this.itemIndex = itemIndex;
	}

	protected getNode(): INode {
		return this.context.getNode();
	}

	protected getNodeParameter<T>(parameterName: string, itemIndex?: number): T {
		return this.context.getNodeParameter(parameterName, itemIndex || this.itemIndex) as T;
	}

	protected wait(milliseconds: number): Promise<void> {
		// eslint-disable-next-line @n8n/community-nodes/no-restricted-globals
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}
}
