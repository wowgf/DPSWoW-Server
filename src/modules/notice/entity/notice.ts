import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 通知
 */
@Entity('notice')
export class NoticeEntity extends BaseEntity {
  @Column({ comment: '用户id', nullable: true })
  userId: number;

  @Column({ comment: '通知标题', nullable: true, length: 500 })
  title: string;

  @Column({ comment: '通知内容', nullable: true, length: 500 })
  content: string;

  @Column({ comment: '通知类型 1-系统通知', nullable: true, default: 1 })
  type: number;

  @Column({ comment: '状态 1-可用 0-停用', nullable: true, default: 1 })
  status: number;

  @Column({ comment: '通知状态 0-未读 1-已读', nullable: true, default: 0 })
  readStatus: number;

  @Column({ comment: '其他数据', nullable: true, type: 'json' })
  data: any;
}
