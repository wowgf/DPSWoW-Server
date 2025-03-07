import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 对话表
 */
@Entity('app_conversation', { comment: '对话表,一对一聊天时仅有一个' })
export class ConversationEntity extends BaseEntity {

  @Column({ comment: '群组名称', nullable: true })
  name: string;

  @Column({ comment: '是否是群组 0-否 1-是', default: 0 })
  isGroup: number;

  @Column({ comment: '群组头像', nullable: true })
  icon: string;

  @Column({ comment: '群组描述', nullable: true })
  description: string;

  @Column({ comment: '创建者ID' })
  creatorId: number;

  @Column({ comment: '接收者ID,群组时为空' })
  receiverId: number;

  @Column({ comment: '最后一条消息', length: 3000, nullable: true })
  lastMessage: string;

  @Column({ comment: '最后一条消息时间' })
  lastMessageTime: Date;

  @Column({ comment: '最后一条消息类型 0-文本 1-图片 2-语音 3-视频 4-文件', type: 'tinyint', default: 0 })
  lastMessageType: number;

}
