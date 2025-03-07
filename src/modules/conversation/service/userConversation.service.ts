import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserConversationEntity } from '../entity/user_conversation.entity';
import { ConversationEntity } from '../entity/conversation.entity';

/**
 * 描述
 */
@Provide()
export class UserConversationService extends BaseService {

  /**
   * 我的对话列表(好友对话列表)
   * 关联targetUserInfo
   */
  async conversationPage(userId: any, query: any) {
    const qb = UserConversationEntity.createQueryBuilder('uc')
      .select([
        'uc',
        'targetUserInfo.id',
        'targetUserInfo.nickName',
        'targetUserInfo.avatarUrl',
        'c.lastMessage',
        'c.lastMessageTime',
        'c.lastMessageType',
      ])
      .leftJoin('uc.targetUserInfo', 'targetUserInfo')
      .leftJoin('uc.conversation', 'c')
      .where('uc.userId = :userId', { userId })
      .andWhere('uc.isShow = 1')
      .orderBy('uc.isTop', 'DESC')
      .addOrderBy('c.lastMessageTime', 'DESC');
    return await this.entityRenderPage(qb, query, false);
  }

  /**
   * 我的对话详情
   */
  async getMyConversationInfo(userId: number, conversationId: number) {
    let data = await UserConversationEntity.findOne({
      select: {
        id: true,
        unreadCount: true,
        targetUserInfo: {
          id: true,
          nickName: true,
          avatarUrl: true,
        }
      },
      where: {
        userId,
        conversationId,
      },
      relations: ['targetUserInfo'],
    });
    return data
  }

  /**
   * 根据对方用户ID获取对话详情
   */
  async getConversationByTargetUserId(userId: number, targetUserId: number) {
    let data = await UserConversationEntity.findOne({
      where: {
        userId,
        targetUserId,
      },
    });
    return data
  }

  /**
   * 清除未读数
   */
  async clearUnreadCount(userId: number, conversationId: number) {
    let data = await UserConversationEntity.findOne({
      where: {
        userId,
        conversationId: conversationId,
      },
    });
    if (!data) return
    data.unreadCount = 0;
    await data.save();
  }

  /**
   * 所有的未读数量
   */
  async getUnreadCount(userId: any) {
    const qb = UserConversationEntity.createQueryBuilder('uc')
      .select([
        'sum(uc.unreadCount) as count',
      ])
      .where('uc.userId = :userId', { userId })
    return await qb.getRawOne()
  }
}
