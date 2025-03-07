import { CoolController, BaseController } from '@cool-midway/core';
import { WowdataItemEnchantCategoryEntity } from '../../entity/itemEnchantCategory';
import { WowdataItemEnchantEntity } from '../../entity/itemEnchant';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: WowdataItemEnchantCategoryEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['part'],
  }
})
export class AdminWowdataItemEnchantCategoryController extends BaseController { }
