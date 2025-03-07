import { CoolController, BaseController, CoolUrlTag, CoolTag, TagTypes } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserSimcRecordService } from '../../service/userSimcRecord.service';

/**
 * 描述
 */
@CoolUrlTag()
@CoolController()
export class AppUserSimcRecordController extends BaseController {

  @Inject()
  userSimcRecordService: UserSimcRecordService;

  @Inject()
  ctx: Context;

  @Get('/lastRecord')
  async getLastRecord() {
    const userId = this.ctx?.user?.id
    const data = await this.userSimcRecordService.getLastRecord(userId)
    return this.ok(data)
  }


  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/info')
  async getQueueAndInfo(@Query('id') id: any) {
    if (!id) {
      return this.fail('参数错误')
    }
    const data = await this.userSimcRecordService.getQueueAndRecord(id)
    return this.ok(data)
  }

  @Post('/userPage')
  async userPage(@Body() body: any) {
    const userId = this.ctx?.user?.id
    const data = await this.userSimcRecordService.userPage(userId, body)
    return this.ok(data)
  }
}
