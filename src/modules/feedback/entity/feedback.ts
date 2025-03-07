import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 用户反馈
 */
@Entity('app_feedback', { comment: '用户反馈表' })
export class FeedbackEntity extends BaseEntity {

  @Column({ comment: '反馈内容', nullable: false, length: 500 })
  content: string;

  @Column({ comment: '用户ID', nullable: true })
  userId: number;

  @Column({ comment: '反馈类型', nullable: true })
  feedbackType: string;

  @Column({ comment: '联系方式', nullable: true })
  contact: string;

  @Column({ comment: '处理状态 0-未处理 1-已处理', default: 0, type: 'tinyint' })
  status: number;

  @Column({ comment: '处理备注', nullable: true })
  remarks: string;

}
