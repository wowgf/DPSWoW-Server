import { CoolController, BaseController, CoolUrlTag, CoolTag, TagTypes } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { WxService } from '../service/wx';

/**
 * 工匠能力
 */
@CoolUrlTag()
@CoolController()
export class WxController extends BaseController {

  @Inject()
  wxService: WxService;

  /**
   * 发送模板消息
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/sendTemplateMsg')
  async sendMsg(@Body() body: any) {
    const { receiveOpenId, templateId, msgData, pageUrl, miniprogram } = body
    const params = { template_id: templateId, url: pageUrl, miniprogram }
    this.wxService.sendTemplateMessage(receiveOpenId, msgData, params)
    return this.ok()
  }

  /**
   * 获取关注用户列表
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/followers')
  async getFollowers() {
    const res = await this.wxService.getFollowers()
    return this.ok(res)
  }

  /**
   * 获取小程序URLScheme
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/getMiniURLScheme')
  async getMiniURLScheme(@Body() body: any) {
    const { path, query, env_version } = body
    return this.ok(await this.wxService.getMiniURLScheme(path, query, env_version))
  }

}
