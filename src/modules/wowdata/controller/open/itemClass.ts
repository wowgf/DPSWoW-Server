import { CoolController, BaseController } from '@cool-midway/core';
import { WowdataItemClassEntity } from '../../entity/itemClass';
import { Body, Inject, Post } from '@midwayjs/core';
import { ItemClassService } from '../../service/itemClass';

/**
 * 描述
 */
@CoolController({
  api: ['list'],
  entity: WowdataItemClassEntity,
})
export class OpenItemClassController extends BaseController {
  @Inject()
  itemClassService: ItemClassService;
  // /**
  //  * 导入数据
  //  */
  // @Post('/import', { summary: '导入数据' })
  // async import(@Body('data') data: any) {
  //   await this.itemClassService.importData(data);
  //   return this.ok();
  // }
}
