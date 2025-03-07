import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { UserConversationService } from '../../service/userConversation.service';

/**
 * 描述
 */
@CoolController()
export class AppUserConversationController extends BaseController {

  @Inject()
  userConversationService: UserConversationService;

  @Post('/page', { summary: '用户好友对话列表' })
  async myConversationPage(@Body() body: any) {
    const userId = this.baseCtx.user.id;
    const data = await this.userConversationService.conversationPage(userId, body);
    return this.ok(data);
  }

  @Post('/info', { summary: '用户对话详情' })
  async myConversationInfo(@Body('conversationId') conversationId: number) {
    const userId = this.baseCtx.user.id;
    const data = await this.userConversationService.getMyConversationInfo(userId, conversationId);
    return this.ok(data);
  }

  //根据targetUserId获取对话详情
  @Post('/infoByUserId', { summary: '根据targetUserId获取对话详情' })
  async myConversationInfoByUserId(@Body('targetUserId') targetUserId: number) {
    if (!targetUserId) {
      return this.fail('参数错误')
    }
    const userId = this.baseCtx.user.id;
    const data = await this.userConversationService.getConversationByTargetUserId(userId, targetUserId);
    return this.ok(data);
  }


  @Post('/clearUnreadCount', { summary: '清除未读数' })
  async clearUnreadCount(@Body('conversationId') conversationId: number) { 
    const userId = this.baseCtx.user.id;
    await this.userConversationService.clearUnreadCount(userId, conversationId);
    return this.ok()
  }

  @Post('/unreadCount', { summary: '所有的未读数量' })
  async unreadCount() { 
    const userId = this.baseCtx.user.id;
    const res = await this.userConversationService.getUnreadCount(userId);
    return this.ok(res)
  }
}
