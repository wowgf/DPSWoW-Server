import { CoolController, BaseController } from '@cool-midway/core';
import { FeedbackEntity } from '../../entity/feedback';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: FeedbackEntity,
})
export class AdminFeedbackController extends BaseController {}
