import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

@Entity('app_user_advert_record')
export class UserAdvertRecord extends BaseEntity {
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '广告ID', nullable: true, length: 50 })
  advertId: string;

  @Column({ comment: '广告类型 1-激励视频', default: 1 })
  adType: number;

  @Column({ comment: '奖励类型 1-积分', default: 1 })
  rewardType: number;

  @Column({ comment: '奖励值', default: 0 })
  rewardValue: number;

  @Column({ comment: '观看状态 1-开始观看 2-已观看', default: 1 })
  status: number;

  @Column({ comment: '开始观看时间', type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ comment: '结束观看时间', type: 'timestamp', nullable: true })
  endTime: Date;
}
