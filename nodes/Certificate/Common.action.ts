import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { BaseAction } from '../../BaseAction';

export abstract class CommonAction extends BaseAction {
	protected constructor(context: IExecuteFunctions, item: INodeExecutionData, itemIndex: number) {
		super(context, item, itemIndex);
	}
}
