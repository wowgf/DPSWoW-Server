import { CoolController, BaseController } from '@cool-midway/core';
import { MessageEntity } from '../../entity/message.entity';

/**
 * 描述
 */
@CoolController({
  api: ['delete', 'info', 'list', 'page'],
  entity: MessageEntity,
  pageQueryOp: {
    fieldEq: ['conversationId', 'senderId', 'receiverId', 'type', 'isShow'],
    keyWordLikeFields: ['content'],
  },
})
export class AdminMessageController extends BaseController {}
