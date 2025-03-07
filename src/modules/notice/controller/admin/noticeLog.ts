import { CoolController, BaseController } from '@cool-midway/core';
import { NoticeLogEntity } from '../../entity/noticeLog.entity';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: NoticeLogEntity,
})
export class AdminNoticeLogController extends BaseController {}
