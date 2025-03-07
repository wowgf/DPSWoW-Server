import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 通知log
 */
@Entity('app_notice_log')
export class NoticeLogEntity extends BaseEntity {

  @Column({ comment: '通知标题', nullable: true, length: 50 })
  title: string;

  @Column({ comment: '通知内容', nullable: true, length: 500 })
  content: string;

  @Column({ comment: '通知类型 1-微信通知 2-站内通知', nullable: true, default: 1 })
  type: number

  @Column({ comment: 'json数据', type: 'json', nullable: true })
  params: object

}
