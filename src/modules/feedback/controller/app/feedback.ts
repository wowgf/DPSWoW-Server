import { CoolController, BaseController } from '@cool-midway/core';
import { FeedbackEntity } from '../../entity/feedback';

/**
 * 描述
 */
@CoolController({
  api: ['add'],
  entity: FeedbackEntity,
  // 向表插入当前登录用户ID
  insertParam: (ctx => {
    return {
      userId: ctx.user.id
    }
  }),
})
export class AppFeedbackController extends BaseController {}