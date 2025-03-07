import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

/**
 * 用户数据
 */
@CoolController()
export class AppUserDataController extends BaseController {

  @Inject()
  ctx: Context;

  /**
   * 获取用户发布的需求总数
   * @param userId 
   * @returns 
   */
  @Get('/myData', { summary: '获取用户的一些数量统计数据' })
  async getUserData() {
  }

}
