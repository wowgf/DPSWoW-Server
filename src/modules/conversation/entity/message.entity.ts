import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { UserInfoEntity } from '../../user/entity/info';

/**
 * 描述
 */
@Entity('app_message')
export class MessageEntity extends BaseEntity {

  @Column({ comment: '对话ID' })
  conversationId: number;

  @Column({ comment: '发送者ID' })
  senderId: number;

  @Column({ comment: '接收者ID' })
  receiverId: number;

  @Column({ comment: '消息内容', type: 'varchar', length: 3000 })
  content: string;

  @Column({ comment: '消息类型 0-文本 1-图片 2-语音 3-视频 4-文件 5-订单 6-发货通知 7-需求询问模板消息', default: 0 })
  type: number;

  @Column({ comment: '发送类型 1-用户 2-自动回复', default: 1 })
  sendType: number;

  @Column({ comment: '是否显示 0-不显示 1-显示', default: 1 })
  isShow: number;

  @Column({ comment: '是否发送 0-未发送 1-已发送', default: 0 })
  isSend: number;

  @ManyToOne(() => ConversationEntity)
  @JoinColumn({ name: 'conversationId' })
  conversation: ConversationEntity;

  @ManyToOne(() => UserInfoEntity)
  @JoinColumn({ name: 'senderId' })
  sender: UserInfoEntity;

  @ManyToOne(() => UserInfoEntity)
  @JoinColumn({ name: 'receiverId' })
  receiver: UserInfoEntity;
}
