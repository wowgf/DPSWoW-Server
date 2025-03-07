import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { MessageService } from '../../service/message.service';
import { MessageEntity } from '../../entity/message.entity';
import { Context } from 'vm';

/**
 * 描述
 */
@CoolController()
export class AppMessageController extends BaseController {

  @Inject()
  messageService: MessageService;

  @Post('/userMessages', { summary: '用户消息列表' })
  async userMessages(@Body() query: any) {
    const userId = this.baseCtx.user.id;
    const data = await this.messageService.userMessageList(query, userId);
    return this.ok(data);
  }
}
