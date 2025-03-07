import { CoolController, BaseController } from '@cool-midway/core';
import { WowdataItemEnchantCategoryEntity } from '../../entity/itemEnchantCategory';
import { WowdataItemEnchantEntity } from '../../entity/itemEnchant';

/**
 * 描述
 */
@CoolController({
  api: ['list',],
  entity: WowdataItemEnchantCategoryEntity,
  listQueryOp: {
    where: () => {
      return [
        ["a.status = status", { status: 1 }],
      ]
    },
    addOrderBy: {
      sort: 'ASC'
    }
  }
})
export class OpenWowdataItemEnchantCategoryController extends BaseController { }
