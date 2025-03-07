import { CoolController, BaseController } from '@cool-midway/core';
import { BannerEntity } from '../../entity/banner';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BannerEntity,
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    fieldEq: ['status', 'position']
  }
})
export class AdminBannerController extends BaseController { }
