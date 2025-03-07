import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { UserInfoEntity } from '../../user/entity/info';

/**
 * 用户好友对话表
 */
@Entity('app_user_conversation')
export class UserConversationEntity extends BaseEntity {

  @Column({ comment: '对话ID' })
  conversationId: number;

  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '聊天对象ID' })
  targetUserId: number;

  @Column({ comment: '未读消息数', default: 0 })
  unreadCount: number;

  @Column({ comment: '最近读到的消息ID', nullable: true })
  lastReadMessageId: number;

  // @Column({ comment: '最近一个消息的内容', nullable: true })
  // lastMessage: string;

  // @Column({ comment: '最近一个消息的时间', nullable: true })
  // lastMessageTime: Date;

  @Column({ comment: '是否置顶 0-否 1-是', default: 0 })
  isTop: number;

  @Column({ comment: '是否有未读消息 0-否 1-是', default: 0 })
  hasUnread: number;

  @Column({ comment: '是否显示 0-否 1-是', default: 1 })
  isShow: number;

  @ManyToOne(() => UserInfoEntity)
  @JoinColumn({ name: 'targetUserId' })
  targetUserInfo: UserInfoEntity;

  @ManyToOne(() => ConversationEntity)
  @JoinColumn({ name: 'conversationId' })
  conversation: ConversationEntity;

  // @ManyToOne(() => UserInfoEntity)
  // @JoinColumn({ name: 'userId' })
  // user: UserInfoEntity;

}
