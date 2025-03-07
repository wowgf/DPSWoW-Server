import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { ChatService } from '../../service/chat.service';

/**
 * 描述
 */
@CoolController()
export class AppChatController extends BaseController {

  @Inject()
  chatService: ChatService

  @Post('/send', { summary: '发送消息给用户' })
  async sendMsgToUser(
    @Body('userId') userId: string,
    @Body('message') message: string,
    @Body('messageType') messageType: number) {
    if (!userId || !message) {
      return this.fail('参数错误')
    }
    // 无法与自己对话
    if (userId == this.baseCtx.user.id) {
      return this.fail('无法与自己对话')
    }
    let conversation = await this.chatService.sendMsgToUser(Number(userId), message, messageType)
    // 触发userId的自动回复
    this.chatService.autoReplyMsg(Number(userId), this.baseCtx.user.id, messageType)
    return this.ok(conversation)

  }

}
