import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 描述
 */
@Entity('app_track', { comment: '行为记录表' })
export class TrackEntity extends BaseEntity {
  @Column({ comment: '用户ID', nullable: true })
  userId: string;

  @Column({ comment: '事件' })
  event: string;

  @Column({ comment: '参数', nullable: true, type: 'json' })
  params: any;

  @Column({ comment: 'IP', nullable: true })
  ip: string;

}
