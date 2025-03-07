import { CoolController, BaseController } from '@cool-midway/core';
import { WowdataItemEntity } from '../../entity/item';
import { Body, Fields, Files, Inject, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import * as fs from 'fs';
import * as path from 'path';
import { WowDataItemService } from '../../service/item';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: WowdataItemEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name'],
  }
})
export class AdminWowDataItemController extends BaseController {

  @Inject()
  itemService: WowDataItemService;

  @Post('/syncItemImgFromRot', { summary: '同步物品图片' })
  async syncItemImgFromRot(@Body('data') data: any) {
    await this.itemService.syncItemImgFromRot(data);
    return this.ok();
  }

  @Post('/syncBossImgFromRot', { summary: '同步BOSS图片' })
  async syncBossImgFromRot(@Body('data') data: any) {
    await this.itemService.syncBossImgFromRot(data);
    return this.ok();
  }


  @Post('/syncFoodImgFromRot', { summary: '同步食物图片' })
  async syncFoodImgFromRot(@Body('data') data: any) {
    await this.itemService.syncFoodImgFromRot(data);
    return this.ok();
  }

  @Post('/syncTalentImgFromRot', { summary: '同步食物图片' })
  async syncTalentImgFromRot(@Body('data') data: any) {
    await this.itemService.syncTalentImgFromRot(data);
    return this.ok();
  }

}
