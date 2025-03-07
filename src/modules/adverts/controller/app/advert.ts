import { Body, Inject, Post, Provide } from '@midwayjs/decorator';
import { BaseController, CoolController } from '@cool-midway/core';
import { AdvertService } from '../../service/advert.service';

/**
 * 广告观看
 */
@Provide()
@CoolController()
export class AppAdvertController extends BaseController {
  @Inject()
  advertService: AdvertService;

  /**
   * 广告开始观看
   */
  @Post('/start')
  async startView(@Body() body: { advertId: string }) {
    const userId = this.baseCtx.user.id;
    await this.advertService.startView(userId, body.advertId)
    return this.ok();
  }

  /**
   * 结束广告观看并发放积分
   */
  @Post('/end')
  async endAdView(@Body() body: { advertId: string }) {
    const userId = this.baseCtx.user.id;
    return this.ok(await this.advertService.endAdView(userId, body.advertId));
  }

  /**
   * 获取今日观看次数
   */
  @Post('/todayCount')
  async getTodayCount() {
    const userId = this.baseCtx.user.id;
    return this.ok(await this.advertService.getViewLimitAndCount(userId));
  }

  /**
   * 查看广告状态
   */
  @Post('/status')
  async getAdvertStatus(@Body() body: { advertId: string }) {
    const userId = this.baseCtx.user.id;
    return this.ok(await this.advertService.getAdvertStatus(userId, body.advertId));
  }
}
