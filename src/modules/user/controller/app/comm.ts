import {
  CoolController,
  BaseController,
  CoolUrlTag,
  TagTypes,
  CoolTag,
} from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { UserWxService } from '../../service/wx';
import { ChatService } from '../../../conversation/service/chat.service';
/**
 * 通用
 */
@CoolUrlTag()
@CoolController()
export class UserCommController extends BaseController {
  @Inject()
  userWxService: UserWxService;

  @Inject()
  chatService: ChatService

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/wxMpConfig', { summary: '获取微信公众号配置' })
  public async getWxMpConfig(@Body('url') url: string) {
    return this.ok(await this.userWxService.getWxMpConfig(url));
  }

  @Post('/isOnline', { summary: '获取用户在线|离线状态' })
  async isOnline(@Body('userIds') userIds: number[]) {
    if (!userIds || !userIds.length) {
      return this.fail('参数错误');
    }
    const res = await Promise.all(
      userIds.map(async (userId) => {
        return {
          userId,
          isOnline: await this.chatService.isUserOnline(userId),
        };
      })
    );
    return this.ok(res);

  }
}
