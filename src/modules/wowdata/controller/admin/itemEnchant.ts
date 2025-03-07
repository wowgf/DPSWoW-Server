import { CoolController, BaseController } from '@cool-midway/core';
import { WowdataItemEnchantEntity } from '../../entity/itemEnchant';
import { Body, Inject, Post } from '@midwayjs/core';
import { ItemEnchantService } from '../../service/itemEnchant';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: WowdataItemEnchantEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name', 'displayName'],
    fieldEq: ['part', 'craftingQuality']
  }
})
export class AdminWowdataItemEnchantController extends BaseController {
  @Inject()
  itemEnchantService: ItemEnchantService;

  /**
   * 导入数据
   */
  @Post('/import', { summary: '导入数据' })
  async import(@Body('data') data: any) {
    let res = await this.itemEnchantService.importData(data);
    return this.ok(res);
  }
}
