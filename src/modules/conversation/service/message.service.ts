import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../entity/message.entity';

/**
 * 描述
 */
@Provide()
export class MessageService extends BaseService {
  @InjectEntityModel(MessageEntity)
  messageEntity: Repository<MessageEntity>;

  /**
   * 根据对话ID获取消息列表
   */
  async userMessageList(query, userId) {
    const { conversationId } = query;
    // 查某对话id，且发送者或接受者包含userId
    const qb = this.messageEntity.createQueryBuilder('msg')
    qb.where('msg.conversationId = :conversationId', { conversationId })
      .andWhere('(msg.senderId = :userId OR msg.receiverId = :userId)', { userId })
      .orderBy('msg.createTime', 'DESC')
    // qb.where('msg.conversationId = :conversationId', { conversationId })
    return await this.entityRenderPage(qb, query, false);

  }
}
