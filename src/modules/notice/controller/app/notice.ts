import { CoolController, BaseController } from '@cool-midway/core';
import { NoticeEntity } from '../../entity/notice';

/**
 * 描述
 */
@CoolController({
  api: ['page'],
  entity: NoticeEntity,
  pageQueryOp: {
    where: async (ctx) => {
      return [
        ['a.userId = :userId', { userId: ctx.user.id }],
        ['a.status = :status and a.userId = null', { status: 1 }]
      ]
    },
  }
})
export class AppNoticeController extends BaseController { }
