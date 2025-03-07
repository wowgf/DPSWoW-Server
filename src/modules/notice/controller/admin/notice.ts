import { CoolController, BaseController } from '@cool-midway/core';
import { NoticeEntity } from '../../entity/notice';
import { NoticeService } from '../../service/notice';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: NoticeEntity,
  service: NoticeService
})
export class AdminNoticeController extends BaseController { }
