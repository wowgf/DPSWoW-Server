import { CoolController, BaseController } from '@cool-midway/core';
import { ConversationEntity } from '../../entity/conversation.entity';

/**
 * 描述
 */
@CoolController({
  api: ['delete', 'info', 'list', 'page'],
  entity: ConversationEntity,
  pageQueryOp: {
    fieldEq: ['creatorId', 'receiverId', 'id', 'isGroup'],
  },
})
export class AdminConversationController extends BaseController { }
