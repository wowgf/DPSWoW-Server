import { CoolController, BaseController } from '@cool-midway/core';
import { WowdataItemClassEntity } from '../../entity/itemClass';
import { Body, Inject, Post } from '@midwayjs/core';
import { ItemClassService } from '../../service/itemClass';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: WowdataItemClassEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['classId']
  }
})
export class AdminItemClassController extends BaseController {
  @Inject()
  itemClassService: ItemClassService;
  /**
   * 导入数据
   */
  @Post('/import', { summary: '导入数据' })
  async import(@Body('data') data: any) {
    await this.itemClassService.importData(data);
    return this.ok();
  }
}
